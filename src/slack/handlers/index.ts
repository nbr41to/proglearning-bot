import e from 'express';

export function indexHandler(app: e.IRouter): void {
  app.get('/', (req, res) => {
    res.json({ status: 200, message: 'Welcome!! progLearning bot' });
  });
}
