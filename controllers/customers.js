const { response, request } = require('express');
const soap = require("soap");
const Customer = require("../models/customer");
const { xmlEscape } = require('soap/lib/utils');
const { getValueGRP } = require('../helpers/getValueGRP');
const url = process.env.WSDL;
const auth = "Basic " + Buffer.from(process.env.X3USER + ":" + process.env.X3PASS).toString("base64");

const customersGet = (req = request, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

const customersPost = (req = request, res = response) => {
    if (req.get('Content-Type') !== 'application/json'){
        return res.status(400).json({
            "isSuccess": false,
            "errorMessage": `The request Content-Type is not 'application/json'`,
            "salesforceId": "",
            "x3Id": ""                      
        })        
    };

    const body = req.body;
    const customer = new Customer( body );

    const requiredFields = 
    [
        'accountName',
        'salesforceId',
        'NIP',
        'billingStreet',
        'billingCity',
        'billingCountry',
        'billingPostalCode',
        'paymentTerm',
        'phone'
    ];

    let field = '';
    let checkRequired = false;
    for (let i = 0; i < requiredFields.length; i++) {
        field = requiredFields[i];
        if (customer[field]==='') {
            checkRequired = true;
            break;
        }    
    }

    if (checkRequired){
        return res.status(400).json({
            "isSuccess": false,
            "errorMessage": `${field} property is required`,
            "salesforceId": customer.salesforceId,
            "x3Id": ""                      
        })
    };

    let xmlString = '';
    xmlString += '<?xml version="1.0" encoding="UTF-8"?>';
    xmlString += '<PARAM>';
        xmlString += '<GRP ID="BPC0_1">';
            xmlString += `<FLD NAME="BCGCOD">${process.env.BCGCOD}</FLD>`;
            xmlString += `<FLD NAME="BPCNUM"></FLD>`; // Automatic Customer Sequence
            xmlString += `<FLD NAME="YSFID">${customer.salesforceId}</FLD>`; 
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPRC_1">';
            xmlString += '<LST NAME="BPRNAM" SIZE="2">';
                xmlString += `<ITM>${customer.accountName}</ITM>`;
                xmlString += `<ITM></ITM>`;
            xmlString += '</LST>';
            xmlString += `<FLD NAME="CRN">${customer.NIP}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPC1_3">';
            xmlString += '<LST NAME="REP" SIZE="2">';
                xmlString += `<ITM>${customer.salesRepCode}</ITM>`;
                xmlString += `<ITM></ITM>`;
            xmlString += '</LST>';
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPC3_1">';
            xmlString += `<FLD NAME="BPAINV">${process.env.BILLADDCODE}</FLD>`;
            xmlString += `<FLD NAME="BPAPYR">${process.env.BILLADDCODE}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPC3_3">';
            xmlString += `<FLD NAME="PTE">${customer.paymentTerm.replaceAll(' ', '').toUpperCase()}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="YBPCC_1">';
            xmlString += `<FLD NAME="YDESCRIPTION">${xmlEscape(customer.description)}</FLD>`;
        xmlString += '</GRP>'; 
        // xmlString += '<GRP ID="YBPCC_2">';
        //     xmlString += `<FLD NAME="YDLVINSTR">${xmlEscape(customer.deliveryIntructions)}</FLD>`;
        // xmlString += '</GRP>';
        xmlString += '<TAB ID="BPAC_1">';
            xmlString += `<LIN NUM="1">`;
                xmlString += `<FLD NAME="CODADR">${process.env.BILLADDCODE}</FLD>`;
                xmlString += `<FLD NAME="BPADES">Billing Address</FLD>`;
                xmlString += `<FLD NAME="BPACRY"></FLD>`;
                xmlString += `<FLD NAME="CRYNAM">${customer.billingCountry}</FLD>`;
                xmlString += `<FLD NAME="ADDLIG1">${xmlEscape(customer.billingStreet)}</FLD>`;
                //xmlString += `<FLD NAME="ADDLIG2">${BPADD[i].ADDLIG2 ?? ''}</FLD>`;
                //xmlString += `<FLD NAME="ADDLIG3">${BPADD[i].ADDLIG3 ?? ''}</FLD>`;
                xmlString += `<FLD NAME="POSCOD">${customer.billingPostalCode.replaceAll('-', '')}</FLD>`;
                xmlString += `<FLD NAME="CTY">${customer.billingCity}</FLD>`;
                xmlString += `<FLD NAME="TEL1">${customer.phone}</FLD>`;
                xmlString += `<FLD NAME="WEB1">${customer.email}</FLD>`;
                xmlString += `<FLD NAME="BPAADDFLG">2</FLD>`;
            xmlString += '</LIN>';
            // xmlString += `<LIN NUM="2">`;
            //     xmlString += `<FLD NAME="CODADR">SHIP</FLD>`;
            //     xmlString += `<FLD NAME="BPADES">Shipping Address</FLD>`;
            //     xmlString += `<FLD NAME="BPACRY"></FLD>`;
            //     xmlString += `<FLD NAME="CRYNAM">${customer.shippingCountry}</FLD>`;
            //     xmlString += `<FLD NAME="ADDLIG1">${xmlEscape(customer.shippingStreet)} ${customer.shippingBuildingNumber}</FLD>`;
            //     //xmlString += `<FLD NAME="ADDLIG2">${BPADD[i].ADDLIG2 ?? ''}</FLD>`;
            //     //xmlString += `<FLD NAME="ADDLIG3">${BPADD[i].ADDLIG3 ?? ''}</FLD>`;
            //     xmlString += `<FLD NAME="POSCOD">${customer.shippingPostalCode}</FLD>`;
            //     xmlString += `<FLD NAME="CTY">${customer.shippingCity}</FLD>`;
            //     xmlString += `<FLD NAME="WEB1">${customer.email}</FLD>`;
            //     xmlString += `<FLD NAME="TEL1">${customer.deliveryPhone}</FLD>`;
            //     xmlString += `<FLD NAME="BPAADDFLG">1</FLD>`;
            //xmlString += '</LIN>';
        xmlString += '</TAB>';
        // xmlString += '<TAB ID="BPC4_1">';
        //     xmlString += `<LIN NUM="1">`;
        //         xmlString += `<FLD NAME="BPAADD">SHIP</FLD>`;
        //         xmlString += `<FLD NAME="BPADESBPC4">Shipping Address</FLD>`;
        //     xmlString += '</LIN>';
        // xmlString += '</TAB>';
    xmlString += '</PARAM>';
    const cnx = {
        "callContext": {
            "codeLang": process.env.X3LANG,
            "poolAlias": process.env.X3POOL
        },
        "publicName" : process.env.BPCWS,
        "objectXml" : xmlString
    };
    soap.createClient(url, (errCreateClient, client) => {
        if (errCreateClient){
            res.status(400).send({
                "isSuccess": false,
                "errorMessage": `An error has occurred creating SOAP client: ${errCreateClient}`,
                "salesforceId": customer.salesforceId,
                "x3Id": ""                      
            });                        
        }
        else {
            client.addHttpHeader('Authorization',auth);

            try {
                client.save(cnx, (errSave, resSoap) => {
                    if (errSave !== null) {
                        return res.status(errSave.response.status).json({
                            "isSuccess": false,
                            "errorMessage": errSave.response.data,
                            "salesforceId": customer.salesforceId,
                            "x3Id": ""                      
                        })                                        
                    };
    
                    let sta = resSoap.saveReturn.status.$value;
                    if (sta===1) {
                        res.status(200).send({
                            "isSuccess": true,
                            "errorMessage": "",
                            "salesforceId": customer.salesforceId,
                            "x3Id": getValueGRP(resSoap.saveReturn.resultXml, "BPCNUM")
                        });
                    }
                    else {
                        let errMsg = "";
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
                            "salesforceId": customer.salesforceId,
                            "x3Id": ""                      
                        });
                    }
                })                    
            } catch (error) {
                res.status(400).send({
                    "isSuccess": false,
                    "errorMessage": error,
                    "salesforceId": customer.salesforceId,
                    "x3Id": ""                      
                })                
            } 
        }
    })
}

const customersPut = (req, res = response) => {

    const { id } = req.params;

    res.json({
        msg: 'put API - customersPut',
        id
    });
}

const customersPatch = (req, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

const customersDelete = (req, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

module.exports = {
    customersGet,
    customersPost,
    customersPut,
    customersPatch,
    customersDelete,
}