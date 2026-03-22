import { Router } from 'express';
import {
    getAllUrls,
    getUrlById,
    createUrl,
    updateUrl,
    deleteUrl,
    refreshUrl,
    uploadCustomImage
} from '../controllers/urlController.js';

const router = Router();

router.get('/', getAllUrls);
router.get('/:id', getUrlById);
router.post('/', createUrl);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);
router.post('/:id/refresh', refreshUrl);
router.post('/:id/image', uploadCustomImage);

export default router;
