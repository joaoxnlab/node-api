import express from 'express';

export function jsonParser(req: express.Request, res: express.Response, next: express.NextFunction) {
	if (['POST', 'PUT', 'PATCH'].includes(req.method))
		express.json()(req, res, next);
	else next();
}
