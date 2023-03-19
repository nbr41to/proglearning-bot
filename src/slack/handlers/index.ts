import express from 'express';

export function indexHandler(app: express.IRouter): void {
  app.get('/', (req, res) => {
    res.json({ status: 200, message: 'Welcome!! progLearning bot' });
  });
}
