
const { Router } = require('express');

const { validateJWT } = require('../middlewares/validateJWT');

const { shippingAddressesGet,
        shippingAddressesPut,
        shippingAddressesPost,
        shippingAddressesDelete,
        shippingAddressesPatch } = require('../controllers/shippingAddresses');

const router = Router();

router.get('/', shippingAddressesGet );

router.put('/:id', shippingAddressesPut );

router.post('/',  [validateJWT], shippingAddressesPost );

router.delete('/', shippingAddressesDelete );

router.patch('/', shippingAddressesPatch );

module.exports = router;