
class OrderItem {
    constructor(obj){
        this.unitPrice = obj.unitPrice ?? '';
        this.quantity = obj.quantity  ?? '';
        this.X3_Code = obj.X3_Code  ?? '';
        this.salesforceId = obj.salesforceId  ?? '';
        this.taxValue = obj.taxValue  ?? '';
        this.totalNetPrice = obj.totalNetPrice  ?? '';
        this.totalTaxValue = obj.totalTaxValue  ?? '';
        this.totalGrossPrice = obj.totalGrossPrice  ?? '';
        this.discountValue = obj.discountValue  ?? '';
    };
};

class Order {
    constructor(obj){
        this.clientId = obj.clientId ?? '';
        this.salesforceId = obj.salesforceId ?? '';
        this.shippingAddressCode = obj.shippingAddressCode ?? '';
        this.deliveryPhone = obj.deliveryPhone ?? '';
        this.shippingCountry = obj.shippingCountry ?? '';
        this.shippingStreet = obj.shippingStreet ?? '';
        this.shippingBuildingNumber = obj.shippingBuildingNumber ?? '';
        this.shippingCity = obj.shippingCity ?? '';
        this.shippingPostalCode = obj.shippingPostalCode ?? '';
        this.deliveryIntructions = obj.deliveryIntructions ?? '';
        this.totalNetAmount = obj.totalNetAmount ?? '';
        this.totalGrossAmount = obj.totalGrossAmount ?? '';
        this.totalTaxAmount = obj.totalTaxAmount ?? '';
        this.deliveryDate = obj.deliveryDate ?? '';
        this.orderStatus = obj.orderStatus ?? '';
        this.paymentTerm = obj.paymentTerm ?? '';
        this.orderItems  = [] ;
    };
};

module.exports = {
    Order,
    OrderItem
};
