import {ReadProjekteRequest, ZepHost, ZepPath} from "./zepSoapRequestModels";
import {isArray} from "util";
import * as moment from "moment-timezone";
import * as firebase from "firebase";
import Reference = firebase.database.Reference;

var xml2js = require('xml2js');
const https = require('https');

export const readProjekte = function(username: string, token: string, reference: Reference) {

  const body = ReadProjekteRequest.replace('zep_token', token).replace('zep_user', username);
  return sendSoapRequest(body, (response: any) => {
    parseSoapResponse(response, (projekteResponse) => {
      let userProjekte = [];

      const projekte = projekteResponse['ns1:ReadProjekteResponse']['projektListe']['projekt'];
      if(isArray(projekte)) {
        projekte.forEach(p => userProjekte = parseProjekt(p, userProjekte));
      } else {
        userProjekte = parseProjekt(projekte, userProjekte);
      }

      reference.update({
        zepProjekte: userProjekte,
        zepProjekteRequestSync: false
      });
    })
  });
}

const parseProjekt = function(projekt, userPorjekte): any {
  const heute = moment().tz("Europe/Zurich").format('YYYY-MM-DD');

  if(projekt.endeDatum && projekt.endeDatum < heute) {
    return userPorjekte;
  }

  let name = projekt.projektNr;
  if(projekt.bezeichnung && projekt.bezeichnung.length > 0) {
    name += ' (' + projekt.bezeichnung + ')';
  }

  let vorgangListe = [];
  if(isArray(projekt.vorgangListe.vorgang)) {
    projekt.vorgangListe.vorgang.forEach(vorgang => vorgangListe = parseVorgang(vorgang, vorgangListe));
  } else {
    vorgangListe = parseVorgang(projekt.vorgangListe.vorgang, vorgangListe)
  }

  userPorjekte.push({
    name: name,
    vorgang: vorgangListe
  });

  return userPorjekte;
}

const parseVorgang  = function(vorgang, vorgangListe): any {
  const heute = moment().tz("Europe/Zurich").format('YYYY-MM-DD');

  if(vorgang.endeDatum && vorgang.endeDatum < heute) {
    return vorgangListe;
  }

  vorgangListe.push(vorgang.vorgangNr);
  return vorgangListe;
}


const parseSoapResponse = function(response: string, callback: (any) => void) {
  var parser = new xml2js.Parser({explicitArray: false, trim: true});
  parser.parseString(response, (err, result) => {
    callback(result['SOAP-ENV:Envelope']['SOAP-ENV:Body']);
  });
}

const sendSoapRequest = function(body: string, callback: (...args: any[]) => void) {

  const request = https.request({
    hostname: ZepHost,
    port: 443,
    path: ZepPath,
    method: 'POST'
  }, (result) => {
    let data = ""
    result.on('data', d => data += d);
    result.on('end', () => callback(data));
  })

  request.on('error', (e) => {
    console.error(e);
  });

  request.write(body);
  request.end();
}
