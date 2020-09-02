export const ZepHost = 'www.zep-online.de';
export const ZepPath = '/zepcenterboard/sync/soap.php?v=7';

export const ReadProjekteRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:zep="http://zep.provantis.de">\n' +
  '  <soapenv:Header/>\n' +
  '  <soapenv:Body>\n' +
  '    <zep:ReadProjekteRequest>\n' +
  '      <!--Optional:-->\n' +
  '      <requestHeader>\n' +
  '        <authorizationToken>zep_token</authorizationToken>\n' +
  '      </requestHeader>\n' +
  '      <readProjekteSearchCriteria>\n' +
  '        <status>in Arbeit</status>\n' +
  '        <userId>zep_user</userId>\n' +
  '      </readProjekteSearchCriteria>\n' +
  '    </zep:ReadProjekteRequest>\n' +
  '  </soapenv:Body>\n' +
  '</soapenv:Envelope>\n';
