
const { Router } = require('express');

const { validateJWT } = require('../middlewares/validateJWT');

const { customersGet,
        customersPut,
        customersPost,
        customersDelete,
        customersPatch } = require('../controllers/customers');

const router = Router();

router.get('/', customersGet );

router.put('/:id', customersPut );

router.post('/', [validateJWT], customersPost );

router.delete('/', customersDelete );

router.patch('/', customersPatch );

module.exports = router;