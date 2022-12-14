
class Customer {
    constructor(obj){
        this.accountName = obj.accountName ?? ''; 
        this.salesforceId = obj.salesforceId ?? '';
        this.salesRepCode = obj.salesRepCode ?? '';
        this.NIP = obj.NIP ?? '';
        this.billingStreet = obj.billingStreet ?? '';
        //this.billingBuildingNumber = obj.billingBuildingNumber ?? '';
        this.billingCity = obj.billingCity ?? '';
        this.billingCountry = obj.billingCountry ?? '';
        this.billingPostalCode = obj.billingPostalCode ?? '';
        this.paymentTerm = obj.paymentTerm ?? '';
        this.phone = obj.phone ?? '';
        this.email = obj.email ?? '';
        this.description = obj.description ?? '';
        // this.deliveryPhone = obj.deliveryPhone ?? '';
        // this.shippingCountry = obj.shippingCountry ?? '';
        // this.shippingStreet = obj.shippingStreet ?? '';
        // this.shippingBuildingNumber = obj.shippingBuildingNumber ?? '';
        // this.shippingCity = obj.shippingCity ?? '';
        // this.shippingPostalCode = obj.shippingPostalCode ?? '';
        // this.deliveryIntructions = obj.deliveryIntructions ?? '';
    };
};

module.exports = Customer;