const { response, request } = require('express');
const soap = require("soap");
const { xmlEscape } = require('soap/lib/utils');
const { getValueGRP } = require('../helpers/getValueGRP');
const { Order, OrderItem }= require("../models/order");
const url = process.env.WSDL;
const auth = "Basic " + Buffer.from(process.env.X3USER + ":" + process.env.X3PASS).toString("base64");

const ordersGet = (req = request, res = response) => {
    res.json({
        msg: 'Non-implemented API ordersGet'
    });
}

const ordersPost = (req, res = response) => {

    const body = req.body;
    let order = new Order( body );
    let lines = [];

    if (body.hasOwnProperty('orderItems')) {
        lines = body.orderItems;
    }

    order.orderItems = [];

    for (let i = 0; i < lines.length; i++) 
    {
        const line = new OrderItem(lines[i]);
        order.orderItems.push( line );
    }

    const requiredFieldsHeader = 
    [
        'deliveryPhone',
        'shippingCountry',
        'shippingStreet',
        'shippingBuildingNumber',
        'shippingCity',
        'shippingPostalCode',
        'deliveryIntructions',
        'totalNetAmount',
        'totalGrossAmount',
        'totalTaxAmount',
        'deliveryDate',
        'salesforceId',
        'paymentTerm',
        'shippingAddressCode'
    ];

    const requiredFieldsDetail =
    [
        'unitPrice',
        'quantity',
        'X3_Code',
        'salesforceId'
    ];

    let field = '';
    let checkRequired = false;
    for (let i = 0; i < requiredFieldsHeader.length; i++) {
        field = requiredFieldsHeader[i];
        if (order[field]==='') {
            checkRequired = true;
            break;
        }    
    }

    if (checkRequired){
        return res.status(400).json({
            "isSuccess": false,
            "errorMessage": `${field} property header is required`,
            "salesforceId": order.salesforceId,
            "x3Id": ""
        })
    };

    let shidat = ""
    if (order.deliveryDate.indexOf('/')>0) {
        let arr = [];
        arr = order.deliveryDate.split('/');
        if (arr.length === 3) {
            shidat = arr[2] + arr[1] + arr[0]
        } else {
            return res.status(400).send({
                "isSuccess": false,
                "errorMessage": "deliveryDate: Incorrect date format (dd/mm/yyyy)",
                "salesforceId": order.salesforceId,
                "x3Id": ""
            });                        
        }
    } else {
        return res.status(400).send({
            "isSuccess": false,
            "errorMessage": "deliveryDate: Incorrect date format (dd/mm/yyyy)",
            "salesforceId": order.salesforceId,
            "x3Id": ""
        });        
    }
    if (order.orderItems.length===0) {
        return res.status(400).send({
            "isSuccess": false,
            "errorMessage": "At least one line is mandatory",
            "salesforceId": order.salesforceId,
            "x3Id": ""
        });
    } else {
        for (let i = 0; i < order.orderItems.length; i++) {
            const line = order.orderItems[i];
            for (let j = 0; j < requiredFieldsDetail.length; j++) {
                field = requiredFieldsDetail[j];
                if (line[field]==='') {
                    checkRequired = true;
                    break;
                }    
            }
            if (checkRequired) {
                field += `[${i+1}]`;
                break;     
            }               
        }
    };

    if (checkRequired){
        return res.status(400).json({
            "isSuccess": false,
            "errorMessage": `${field} property line is required`,
            "salesforceId": order.salesforceId,
            "x3Id": ""
        })
    };

    let xmlString = '';
    xmlString += '<?xml version="1.0" encoding="UTF-8"?>';
    xmlString += '<PARAM>';
        xmlString += '<GRP ID="SOH0_1">';
            xmlString += `<FLD NAME="SALFCY">${process.env.SALFCY}</FLD>`;
            xmlString += `<FLD NAME="SOHTYP">${process.env.SOHTYP}</FLD>`;
            xmlString += `<FLD NAME="SOHNUM"></FLD>`;
            xmlString += `<FLD NAME="CUSORDREF">${order.salesforceId}</FLD>`;
            xmlString += `<FLD NAME="ORDDAT">${shidat}</FLD>`;
            xmlString += `<FLD NAME="BPCORD">${order.clientId}</FLD>`;
            xmlString += `<FLD NAME="YSFID">${order.salesforceId}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="SOH1_1">';
            xmlString += `<FLD NAME="BPAADD">${order.shippingAddressCode}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="SOH2_1">';
            xmlString += `<FLD NAME="STOFCY">${process.env.STOFCY}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="ADB2_1">';
            xmlString += '<LST NAME="BPAADDLIG" SIZE="3">'
                xmlString += `<ITM>${xmlEscape(order.shippingStreet)} ${order.shippingBuildingNumber}</ITM>`
                xmlString += '<ITM></ITM>'
                xmlString += '<ITM></ITM>'
            xmlString += '</LST>'
            xmlString += `<FLD NAME="CRYNAM">${order.shippingCountry}</FLD>`;
            xmlString += `<FLD NAME="POSCOD">${order.shippingPostalCode}</FLD>`;
            xmlString += `<FLD NAME="CTY">${order.shippingCity}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="YBPCC_1">';
            xmlString += '<FLD NAME="YDESCRIPTION"></FLD>';
        xmlString += '</GRP>'; 
        xmlString += '<GRP ID="YBPCC_2">';
            xmlString += `<FLD NAME="YDLVINSTR">${xmlEscape(order.deliveryIntructions)}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<TAB ID="SOH4_1">';
        for (let i = 0; i < order.orderItems.length; i++) {
            const line = order.orderItems[i];
            xmlString += `<LIN NUM="${i+1}">`;
                xmlString += `<FLD NAME="ITMREF">${line.X3_Code}</FLD>`;
                xmlString += `<FLD NAME="QTY">${line.quantity}</FLD>`;
                xmlString += `<FLD NAME="GROPRI">${line.unitPrice}</FLD>`;
            xmlString += '</LIN>';
        }
        xmlString += '</TAB>';
    xmlString += '</PARAM>';
    const cnx = {
        "callContext": {
            "codeLang": process.env.X3LANG,
            "poolAlias": process.env.X3POOL
        },
        "publicName" : process.env.SOHWS,
        "objectXml" : xmlString
    };
    soap.createClient(url, (errCreateClient, client) => {
        if (errCreateClient){
            res.status(400).json({
                "isSuccess": false,
                "errorMessage": `An error has occurred creating SOAP client: ${err}`,
                "salesforceId": order.salesforceId,
                "x3Id": ""
            })            
        }
        else {
            client.addHttpHeader('Authorization',auth);
            client.save(cnx, (errSave,resSoap) => {
                if (errSave !== null) {
                    return res.status(errSave.response.status).json({
                        "isSuccess": false,
                        "errorMessage": errSave.response.data,
                        "salesforceId": order.salesforceId,
                        "x3Id": ""                      
                    })                                        
                };
            
                let sta = resSoap.saveReturn.status.$value;
                if (sta===1) {
                    res.status(200).send({
                        "isSuccess": true,
                        "errorMessage": "",
                        "salesforceId": order.salesforceId,
                        "x3Id": getValueGRP(resSoap.saveReturn.resultXml, "SOHNUM")
                    });
                }
                else {
                    let errMsg = '';
                    if (typeof(resSoap.saveReturn.messages) === 'undefined') {
                        errMsg = "ERROR"
                    } else {
                        if (Array.isArray(resSoap.saveReturn.messages)) {
                            for (let idx = 0; idx < resSoap.saveReturn.messages.length; idx++) {
                                const objErrMsg = resSoap.saveReturn.messages[idx];
                                if (objErrMsg.type === '3') {
                                    if (errMsg !=='' ) errMsg += '\n';
                                    errMsg += objErrMsg.message;
                                }
                            }
                            //errMsg = resSoap.saveReturn.messages[0].message
                        } else {
                            errMsg = resSoap.saveReturn.messages.message
                        }
                    }
                    res.status(400).send({
                        "isSuccess": false,
                        "errorMessage": errMsg,
                        "salesforceId": order.salesforceId,
                        "x3Id": ""                      
                    });
                }
            })
        }
    })
}

const ordersPut = (req, res = response) => {

    const { id } = req.params;

    res.json({
        msg: 'put API - ordersPut',
        id
    });
}

const ordersPatch = (req, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

const ordersDelete = (req, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

module.exports = {
    ordersGet,
    ordersPost,
    ordersPut,
    ordersPatch,
    ordersDelete,
}