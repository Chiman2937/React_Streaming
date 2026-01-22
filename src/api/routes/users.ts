import express from 'express';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const users = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    res.json(users);
  } catch {
    res.status(500).json({ error: '공통 서버 에러' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = { id: req.params.id, name: 'John' };
    res.json(user);
  } catch {
    res.status(500).json({ error: '공통 서버 에러' });
  }
});

export default router;
