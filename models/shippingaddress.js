
class Shippingaddress {
    constructor(obj){
        this.x3CustomerId = obj.x3CustomerId ?? ''; 
        this.salesforceId = obj.salesforceId ?? '';
        this.deliveryPhone = obj.deliveryPhone ?? '';
        this.shippingCountry = obj.shippingCountry ?? '';
        this.shippingStreet = obj.shippingStreet ?? '';
        this.shippingCity = obj.shippingCity ?? '';
        this.shippingPostalCode = obj.shippingPostalCode ?? '';
        this.deliveryIntructions = obj.deliveryIntructions ?? '';
        this.deliveryEmail = obj.deliveryEmail ?? '';
    };
};

module.exports = Shippingaddress;