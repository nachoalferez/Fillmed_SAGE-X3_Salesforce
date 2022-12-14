
const { Router } = require('express');

const { validateJWT } = require('../middlewares/validateJWT');

const { ordersGet,
        ordersPut,
        ordersPost,
        ordersDelete,
        ordersPatch } = require('../controllers/orders');

const router = Router();

router.get('/', ordersGet );

router.put('/:id', ordersPut );

router.post('/', [validateJWT], ordersPost );

router.delete('/', ordersDelete );

router.patch('/', ordersPatch );

module.exports = router;