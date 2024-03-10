// src/routes/reviews.router.js
import express from 'express';
const router = express.Router({ mergeParams: true });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import commentsRouter from './comments.router.js';


// 리뷰 작성 API
router.post('/', async (req, res) => {
  const { bookTitle, title, content, starRating, author, password } = req.body;

  // 별점 유효성 검사
  if (starRating < 1 || starRating > 10) {
    return res.status(400).send({ message: '별점은 1점에서 10점 사이여야 합니다.' });
  }

  try {
    const newReview = await prisma.review.create({
      data: {
        bookTitle,
        title,
        content,
        starRating,
        author,
        password,
      },
    });
    res.status(201).send(newReview);
  } catch (error) {
    console.error(error); // 에러의 상세 정보를 터미널에 로깅
    res.status(500).send({ message: '리뷰 작성 중 오류가 발생했습니다.', error: error.message });
  }
});

// 리뷰 목록 조회 API
router.get('/', async (req, res) => {
  try {
    const review = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id:true,
        bookTitle: true,
        author: true,
        title: true,
        starRating: true,
        content:true,
        createdAt: true,
      },
    });
    res.status(200).send(review);
  } catch (error) {
    res.status(500).send({ message: '리뷰 목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

// 리뷰 상세 조회 API
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!review) {
      return res.status(404).send({ message: '존재하지 않는 리뷰입니다.' });
    }
    res.status(200).send(review);
  } catch (error) {
    res.status(500).send({ message: '리뷰 상세 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

// 리뷰 수정 API
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, starRating, password } = req.body;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReview) {
      return res.status(404).send({ message: '존재하지 않는 리뷰입니다.' });
    }

    if (existingReview.password !== password) {
      return res.status(401).send({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { title, content, starRating },
    });

    res.status(200).send(updatedReview);
  } catch (error) {
    res.status(500).send({ message: '리뷰 수정 중 오류가 발생했습니다.', error: error.message });
  }
});

// 리뷰 삭제 API
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReview) {
      return res.status(404).send({ message: '존재하지 않는 리뷰입니다.' });
    }

    if (existingReview.password !== password) {
      return res.status(401).send({ message: '비밀번호가 일치하지 않습니다.' });
    }

    await prisma.review.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: '리뷰 삭제 중 오류가 발생했습니다.', error: error.message });
  }
});

//댓글라우터를 여기서 만들기!
router.use('/:reviewId/comments', commentsRouter);

export default router;



