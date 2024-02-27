// src/routes/comments.router.js
import express from 'express';
const router = express.Router({ mergeParams: true });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 댓글 작성 API
router.post('/', async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const { content, author, password } = req.body;

  // content가 비어 있는지 검사
  if (!content) {
    return res.status(400).send({ message: '댓글 내용을 입력해주세요' });
  }

  try {
    // 해당 reviewId를 가진 리뷰가 존재하는지 확인
    const reviewExists = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    // 리뷰가 존재하지 않는 경우 에러 메시지 반환
    if (!reviewExists) {
      return res.status(404).send({ message: '해당 리뷰가 존재하지 않습니다.' });
    }

    // reviewId를 포함하여 댓글 데이터 생성
    const newComment = await prisma.comment.create({
      data: {
        reviewId, // 이 부분이 중요합니다
        content,
        author,
        password,
      },
    });
    res.status(201).send(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '댓글 작성 중 오류가 발생했습니다.', error: error.message });
  }
});



// 댓글 목록 조회 API
router.get('/', async (req, res) => {
  const { reviewId } = req.params; // URL에서 reviewId 추출
  try {
    const comments = await prisma.comment.findMany({
      where: {
        reviewId: parseInt(reviewId), // reviewId를 기준으로 필터링
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).send(comments);
  } catch (error) {
    res.status(500).send({ message: '댓글 목록 조회 중 오류가 발생했습니다.', error: error.message });
  }
});


// 댓글 수정 API
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, password } = req.body;

  if (!content) {
    return res.status(400).send({ message: '댓글 내용을 입력해주세요' });
  }

  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).send({ message: '존재하지 않는 댓글입니다.' });
    }

    if (existingComment.password !== password) {
      return res.status(401).send({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });

    res.status(200).send(updatedComment);
  } catch (error) {
    res.status(500).send({ message: '댓글 수정 중 오류가 발생했습니다.', error: error.message });
  }
});

// 댓글 삭제 API
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).send({ message: '존재하지 않는 댓글입니다.' });
    }

    if (existingComment.password !== password) {
      return res.status(401).send({ message: '비밀번호가 일치하지 않습니다.' });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).send({ message: '댓글 삭제 중 오류가 발생했습니다.', error: error.message });
  }
});

export default router;
