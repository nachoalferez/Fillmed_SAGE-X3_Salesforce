const { response, request } = require('express');
const soap = require("soap");
const Shippingaddress = require("../models/shippingaddress");
const { xmlEscape } = require('soap/lib/utils');
const { getValueGRP } = require('../helpers/getValueGRP');
const url = process.env.WSDL;
const auth = "Basic " + Buffer.from(process.env.X3USER + ":" + process.env.X3PASS).toString("base64");

const shippingAddressesGet = (req = request, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

const shippingAddressesPost = (req, res = response) => {

    if (req.get('Content-Type') !== 'application/json'){
        return res.status(400).json({
            "isSuccess": false,
            "errorMessage": `The request Content-Type is not 'application/json'`,
            "salesforceId": "",
            "x3Id": ""                      
        })        
    };

    const body = req.body;
    const shipAdd = new Shippingaddress( body );
    const requiredFields = 
    [
        'x3CustomerId',
        'salesforceId',
        'shippingCountry',
        'shippingStreet',
        'shippingCity',
        'shippingPostalCode'
    ];

    let field = '';
    let checkRequired = false;
    for (let i = 0; i < requiredFields.length; i++) {
        field = requiredFields[i];
        if (shipAdd[field]==='') {
            checkRequired = true;
            break;
        }    
    }

    if (checkRequired){
        return res.status(400).json({
            "isSuccess": false,
            "errorMessage": `${field} property is required`,
            "salesforceId": shipAdd.salesforceId,
            "x3Id": ""
        })
    };

    let xmlString = '';
    xmlString += '<?xml version="1.0" encoding="UTF-8"?>';
    xmlString += '<PARAM>';
        xmlString += '<GRP ID="BPD0_1">';
            xmlString += `<FLD NAME="BPCNUM">${shipAdd.x3CustomerId}</FLD>`;
            xmlString += '<FLD NAME="BPAADD">L999</FLD>';
            xmlString += `<FLD NAME="YSFID">${shipAdd.salesforceId}</FLD>`; 
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPD2_1">';
            xmlString += `<FLD NAME="CRYNAM">${shipAdd.shippingCountry}</FLD>`;
            xmlString += `<FLD NAME="ADDLIG1">${xmlEscape(shipAdd.shippingStreet)}</FLD>`;
            //xmlString += `<FLD NAME="ADDLIG2">${BPADD[i].ADDLIG2 ?? ''}</FLD>`;
            //xmlString += `<FLD NAME="ADDLIG3">${BPADD[i].ADDLIG3 ?? ''}</FLD>`;
            xmlString += `<FLD NAME="POSCOD">${shipAdd.shippingPostalCode.replaceAll('-','')}</FLD>`;
            xmlString += `<FLD NAME="CTY">${shipAdd.shippingCity}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPD2_2">';
            xmlString += `<FLD NAME="TEL">${shipAdd.deliveryPhone}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="BPD2_3">';
            xmlString += `<FLD NAME="WEB">${shipAdd.deliveryEmail}</FLD>`;
        xmlString += '</GRP>';
        xmlString += '<GRP ID="YBPCC_2">';
            xmlString += `<FLD NAME="YDLVINSTR">${xmlEscape(shipAdd.deliveryIntructions)}</FLD>`;
        xmlString += '</GRP>';
    xmlString += '</PARAM>';
    const cnx = {
        "callContext": {
            "codeLang": process.env.X3LANG,
            "poolAlias": process.env.X3POOL
        },
        "publicName" : process.env.BPDWS,
        "objectXml" : xmlString
    };
    soap.createClient(url, (errCreateClient, client) => {
        if (errCreateClient){
            res.status(400).send({
                "isSuccess": false,
                "errorMessage": `An error has occurred creating SOAP client: ${err}`,
                "salesforceId": shipAdd.salesforceId,
                "x3Id": ""
            });                        
        }
        else {
            client.addHttpHeader('Authorization',auth);
            client.save(cnx, (errSave,resSoap) => {
                if (errSave !== null) {
                    return res.status(errSave.response.status).json({
                        "isSuccess": false,
                        "errorMessage": errSave.response.data,
                        "salesforceId": shipAdd.salesforceId,
                        "x3Id": ""                      
                    })                                        
                };

                let sta = resSoap.saveReturn.status.$value;
                if (sta===1) {
                    res.status(200).send({
                        "isSuccess": true,
                        "errorMessage": "",
                        "salesforceId": shipAdd.salesforceId,
                        "x3Id": shipAdd.x3CustomerId + '/' + getValueGRP(resSoap.saveReturn.resultXml, "BPAADD")
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
                        "salesforceId": shipAdd.salesforceId,
                        "x3Id": ""                      
                    });
                }
            })
        }
    })
}

const shippingAddressesPut = (req, res = response) => {

    const { id } = req.params;

    res.json({
        msg: 'put API - shippingAddressesPut',
        id
    });
}

const shippingAddressesPatch = (req, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

const shippingAddressesDelete = (req, res = response) => {
    res.json({
        msg: 'Non-implemented API'
    });
}

module.exports = {
    shippingAddressesGet,
    shippingAddressesPost,
    shippingAddressesPut,
    shippingAddressesPatch,
    shippingAddressesDelete,
}