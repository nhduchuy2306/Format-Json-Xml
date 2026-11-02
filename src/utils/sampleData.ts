export const sampleJson = String.raw`{
  "app": "Format JSON & XML Pro",
  "version": "1.0.0",
  "status": "success",
  "description": "Hỗ trợ format JSON, XML, Multi-Tab, Compare & Nested Serialized String",
  "features": [
    "Auto Format on Ctrl+S",
    "Nested JSON/XML string unescaping",
    "Side-by-side Diff Compare",
    "Monaco VS Code Engine"
  ],
  "nestedDemo": "{\"traceId\":\"TR-9988\",\"details\":\"{\\\"user\\\":\\\"admin\\\",\\\"action\\\":\\\"login\\\"}\",\"active\":true}",
  "xmlStringDemo": "<response><status>OK</status><timestamp>2026-11-02</timestamp></response>"
}`;

export const sampleXml = String.raw`<?xml version="1.0" encoding="UTF-8"?>
<serviceResponse>
  <status>200</status>
  <message>Thành công</message>
  <metadata>
    <timestamp>2026-11-02T21:00:00Z</timestamp>
    <server>prod-cluster-01</server>
  </metadata>
  <data><![CDATA[{"transactionId": "TX-123456", "amount": 500000, "currency": "VND", "nestedPayload": "{\"bank\":\"VCB\",\"verified\":true}"}]]></data>
  <nestedXmlEncoded>&lt;subResult&gt;&lt;code&gt;SUCCESS&lt;/code&gt;&lt;note&gt;Nested XML content&lt;/note&gt;&lt;/subResult&gt;</nestedXmlEncoded>
</serviceResponse>`;

export const sampleCompareOriginal = `{
  "id": 101,
  "name": "Sản phẩm A",
  "price": 250000,
  "category": "Điện tử",
  "inStock": true,
  "tags": ["mới", "giảm giá"]
}`;

export const sampleCompareModified = `{
  "id": 101,
  "name": "Sản phẩm A (Phiên bản 2)",
  "price": 220000,
  "category": "Điện tử & Gia dụng",
  "inStock": true,
  "discount": "12%",
  "tags": ["mới", "hot sale", "freeship"]
}`;

export const sampleRequest = `{
  "action": "SearchCurrentAccount",
  "channel": "MOBILE_BANKING",
  "requestTime": "2026-11-02T22:30:00Z",
  "criteria": {
    "accountNo": "0965777792",
    "includeBalances": true,
    "limit": 10
  }
}`;

export const sampleResponse = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ns2:SearchCurrentAccountResponse xmlns:ns2="http://www.alsb.com/">
  <responseCode>00</responseCode>
  <description>Thành công</description>
  <accountInfo>
    <AccountNo>0965777792</AccountNo>
    <AccountName>NGUYEN VAN A</AccountName>
    <Currency>VND</Currency>
    <AvailableBalance>158500000</AvailableBalance>
    <Status>ACTIVE</Status>
  </accountInfo>
</ns2:SearchCurrentAccountResponse>`;

