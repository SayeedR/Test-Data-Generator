(function (root) {
  'use strict';
  const FIRST = ['Aarav','Ayesha','Rahim','Fatima','Liam','Olivia','Noah','Emma','Mateo','Sofia','Hiroshi','Yuki','Chen','Mei','Omar','Layla','Ivan','Anya','Kwame','Amara','Nusrat','Tanvir','Arjun','Priya','Lucas','Chloe','Ethan','Zara'];
  const LAST = ['Rahman','Hossain','Khan','Ahmed','Smith','Johnson','Garcia','Martinez','Tanaka','Sato','Wang','Li','Ali','Hassan','Petrov','Ivanova','Mensah','Okafor','Patel','Sharma','Brown','Miller','Davis','Nguyen'];
  const STREETS = ['Main St','Oak Ave','Maple Rd','Park Lane','Lake View Dr','Station Rd','Green St','Sunset Blvd'];
  // [city, state/region, postal code]
  const COUNTRIES = {
    Bangladesh: { dial: '+880', cities: [['Dhaka','Dhaka Division','1207'],['Chattogram','Chattogram Division','4000'],['Sylhet','Sylhet Division','3100'],['Rajshahi','Rajshahi Division','6000']] },
    'United States': { dial: '+1', cities: [['New York','NY','10001'],['Austin','TX','73301'],['Chicago','IL','60601'],['Seattle','WA','98101']] },
    'United Kingdom': { dial: '+44', cities: [['London','England','EC1A 1BB'],['Manchester','England','M1 1AE'],['Edinburgh','Scotland','EH1 1YZ']] },
    Canada: { dial: '+1', cities: [['Toronto','ON','M5H 2N2'],['Vancouver','BC','V6B 1A1'],['Montreal','QC','H2Y 1C6']] },
    Australia: { dial: '+61', cities: [['Sydney','NSW','2000'],['Melbourne','VIC','3000'],['Brisbane','QLD','4000']] },
    Germany: { dial: '+49', cities: [['Berlin','Berlin','10115'],['Munich','Bavaria','80331'],['Hamburg','Hamburg','20095']] },
    India: { dial: '+91', cities: [['Mumbai','Maharashtra','400001'],['Delhi','Delhi','110001'],['Bengaluru','Karnataka','560001']] }
  };
  // Phone numbers follow each country's code and mobile format (fictional/reserved ranges where they exist)
  const PHONE = {
    Bangladesh: (h) => { const s = `1${h.int(3, 9)}${h.digits(8)}`; return { intl: `+880 ${s.slice(0, 2)} ${s.slice(2, 6)} ${s.slice(6)}`, national: `0${s.slice(0, 4)} ${s.slice(4)}` }; },
    'United States': (h) => { const a = h.pick(['212','415','512','202','305','312','206']), l = h.pad(h.int(0, 99)); return { intl: `+1 ${a} 555 01${l}`, national: `(${a}) 555-01${l}` }; },
    Canada: (h) => { const a = h.pick(['416','604','514','403']), l = h.pad(h.int(0, 99)); return { intl: `+1 ${a} 555 01${l}`, national: `(${a}) 555-01${l}` }; },
    'United Kingdom': (h) => { const n = h.digits(3); return { intl: `+44 7700 900${n}`, national: `07700 900${n}` }; },
    Australia: (h) => { const n = h.digits(3); return { intl: `+61 491 570 ${n}`, national: `0491 570 ${n}` }; },
    Germany: (h) => { const p = h.pick(['151','152','157','160','162','170','176']), n = h.digits(8); return { intl: `+49 ${p} ${n}`, national: `0${p} ${n}` }; },
    India: (h) => { const a = `${h.int(6, 9)}${h.digits(4)}`, b = h.digits(5); return { intl: `+91 ${a} ${b}`, national: `0${a} ${b}` }; }
  };
  const COMPANY = ['Acme','Globex','Initech','Umbrella','Hooli','Stark','Wayne','Wonka','Soylent','Vandelay'];
  const SUFFIX = ['Ltd','Inc','LLC','Corp','Systems','Labs'];
  const JOBS = ['QA Engineer','Software Developer','Product Manager','Business Analyst','DevOps Engineer','UX Designer','Data Analyst','Support Specialist'];
  const DOMAINS = ['example.com','example.org','example.net'];
  const WORDS = ['system','report','invoice','profile','account','order','payment','status','update','review','dashboard','session','record','request','service','module','release','ticket','search','filter'];
  // Public test card numbers published by payment providers (not real cards)
  const CARDS = ['4242424242424242','5555555555554444','378282246310005','6011111111111117','4000056655665556'];
  // Security test payloads: standard detection probes for input-validation testing (non-destructive)
  const SEC_DEFS = [
    ["secXss", "XSS (cross-site scripting)", [
      "<script>alert(1)</script>",
      "\"><script>alert(1)</script>",
      "'><script>alert(1)</script>",
      "</script><script>alert(1)</script>",
      "<ScRiPt>alert(1)</sCrIpT>",
      "<img src=x onerror=alert(1)>",
      "<svg onload=alert(1)>",
      "<body onload=alert(1)>",
      "<details open ontoggle=alert(1)>",
      "<iframe src=\"javascript:alert(1)\"></iframe>",
      "<a href=\"javascript:alert(1)\">click</a>",
      "javascript:alert(1)",
      "\" onmouseover=\"alert(1)",
      "' onfocus='alert(1)' autofocus='",
      "<script>alert(String.fromCharCode(88,83,83))</script>"
    ]],
    ["secHtml", "HTML injection", [
      "<h1>injected</h1>",
      "<b>bold</b>",
      "<marquee>injected</marquee>",
      "<a href=\"http://example.com\">click here</a>",
      "<form action=\"http://example.com\"><input name=x></form>",
      "<style>body{display:none}</style>",
      "<meta http-equiv=\"refresh\" content=\"0;url=http://example.com\">",
      "<base href=\"http://example.com/\">"
    ]],
    ["secSqli", "SQL injection", [
      "'",
      "\"",
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR 1=1 --",
      "\" OR \"1\"=\"1",
      "') OR ('1'='1",
      "admin' --",
      "admin' #",
      "1 OR 1=1",
      "' AND 1=2--",
      "1' ORDER BY 1--",
      "' UNION SELECT NULL--",
      "' UNION SELECT NULL,NULL--",
      "' OR SLEEP(5)--",
      "'; WAITFOR DELAY '0:0:5'--"
    ]],
    ["secNoSql", "NoSQL injection", [
      "{\"$ne\": null}",
      "{\"$gt\": \"\"}",
      "{\"$regex\": \".*\"}",
      "{\"$where\": \"1==1\"}",
      "[$ne]=1",
      "' || '1'=='1",
      "';return true;var a='"
    ]],
    ["secCmd", "OS command injection", [
      "; id",
      "| id",
      "|| id",
      "&& id",
      "& whoami",
      "`id`",
      "$(id)",
      "; ping -c 1 127.0.0.1",
      "| dir",
      "%0Aid",
      "$(sleep 5)"
    ]],
    ["secPath", "Path traversal / LFI", [
      "../",
      "../../../etc/passwd",
      "..\\..\\..\\windows\\win.ini",
      "....//....//....//etc/passwd",
      "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "..%252f..%252fetc%252fpasswd",
      "..%c0%af..%c0%afetc/passwd",
      "/etc/passwd",
      "C:\\Windows\\win.ini",
      "file:///etc/passwd",
      "/etc/passwd%00.jpg"
    ]],
    ["secSsti", "Template injection (SSTI)", [
      "{{7*7}}",
      "${7*7}",
      "<%= 7*7 %>",
      "#{7*7}",
      "*{7*7}",
      "@(7*7)",
      "{{7*'7'}}",
      "{{config}}",
      "${{7*7}}",
      "{{constructor.constructor('alert(1)')()}}"
    ]],
    ["secXxe", "XML / XXE", [
      "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><foo>&xxe;</foo>",
      "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"http://127.0.0.1/\">]><foo>&xxe;</foo>",
      "<!DOCTYPE foo [<!ENTITY % xxe SYSTEM \"file:///etc/hostname\"> %xxe;]>",
      "<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY test \"injected\">]><foo>&test;</foo>"
    ]],
    ["secLdap", "LDAP injection", [
      "*",
      "*)(&",
      "*)(uid=*))(|(uid=*",
      "admin)(&)",
      ")(cn=*",
      "*)(objectClass=*",
      "admin*",
      "\\00"
    ]],
    ["secCrlf", "CRLF / header injection", [
      "%0d%0aSet-Cookie:test=1",
      "%0d%0aX-Injected:header",
      "test\r\nX-Injected: header",
      "test%0d%0aBcc:test@example.com",
      "%0aLocation:http://example.com",
      "%E5%98%8A%E5%98%8DX-Injected:1"
    ]],
    ["secRedirect", "Open redirect", [
      "//example.com",
      "https://example.com",
      "/\\example.com",
      "\\/\\/example.com",
      "https:example.com",
      "//example.com/%2f..",
      "javascript:alert(1)"
    ]],
    ["secSsrf", "SSRF", [
      "http://127.0.0.1",
      "http://localhost",
      "http://[::1]",
      "http://0.0.0.0",
      "http://127.1",
      "http://2130706433",
      "http://0177.0.0.1",
      "http://169.254.169.254/latest/meta-data/",
      "file:///etc/hostname"
    ]],
    ["secFormula", "CSV / formula injection", [
      "=1+1",
      "+1+1",
      "-1+1",
      "@SUM(1+1)",
      "=HYPERLINK(\"http://example.com\",\"click\")",
      "=IMPORTXML(\"http://example.com\",\"//a\")"
    ]],
    ["secProto", "Prototype pollution", [
      "{\"__proto__\":{\"polluted\":true}}",
      "{\"constructor\":{\"prototype\":{\"polluted\":true}}}",
      "__proto__[polluted]=true",
      "constructor.prototype.polluted=true"
    ]],
    ["secFile", "Malicious file names", [
      "shell.php.jpg",
      "test.jpg.exe",
      "../../evil.png",
      "test.php%00.jpg",
      ".htaccess",
      "<script>alert(1)</script>.png",
      "a'b\".png",
      ";id.png",
      "CON.txt",
      "file name with spaces .png"
    ]],
    ["secLog", "Log injection", [
      "test\r\n[INFO] Forged log entry",
      "test\n[ERROR] Forged log entry",
      "test%0d%0a[INFO] Forged log entry",
      "test\n127.0.0.1 - - \"GET /admin HTTP/1.1\" 200",
      "\\u001b[31mred text"
    ]],
    ["secFormat", "Format string", [
      "%s%s%s%s%s",
      "%x%x%x%x",
      "%08x.%08x.%08x",
      "%d%d%d%d",
      "%n",
      "{0}{1}{2}",
      "{{}}"
    ]],
    ["secEncoding", "Encoding / null-byte bypass", [
      "%3Cscript%3Ealert(1)%3C/script%3E",
      "%253Cscript%253Ealert(1)%253C/script%253E",
      "&#60;script&#62;alert(1)&#60;/script&#62;",
      "&lt;script&gt;alert(1)&lt;/script&gt;",
      "\\u003cscript\\u003ealert(1)\\u003c/script\\u003e",
      "\\x3cscript\\x3ealert(1)\\x3c/script\\x3e",
      "＜script＞alert(1)＜/script＞",
      "%00",
      "test%00.txt",
      "\\0",
      "%00' OR '1'='1"
    ]],
    ["secOverflow", "Long input / overflow", [
      'A'.repeat(1000),
      'A'.repeat(5000),
      'A'.repeat(10000),
      'A'.repeat(65536)
    ]],
    ["secMalformed", "Malformed JSON / XML", [
      "{",
      "}",
      "[",
      "{\"a\":",
      "{\"a\":\"b\"",
      "<a>",
      "<?xml",
      "{\"a\":{\"a\":{\"a\":{\"a\":{\"a\":{\"a\":{\"a\":1}}}}}}}"
    ]]
  ];
  const SEC_BY_ID = {}; SEC_DEFS.forEach((d) => { SEC_BY_ID[d[0]] = d[2]; });
  const SEC_ALL = [].concat(...SEC_DEFS.map((d) => d[2]));

  const EDGE = {
    edgeEmpty: () => '',
    edgeLong255: () => 'a'.repeat(255),
    edgeLong256: () => 'a'.repeat(256),
    edgeUnicode: () => 'Ünïcödé Tëst Çhäräctërs ñ ß 日本語 中文 한국어 বাংলা',
    edgeEmoji: () => '😀 Test 🚀 data 👨‍👩‍👧‍👦 ✅',
    edgeRTL: () => 'مرحبا بالعالم שלום עולם',
    edgeSpecial: () => "!@#$%^&*()_+-=[]{}|;':\",./<>?`~\\",
    edgeSpaces: () => '  leading and trailing spaces  ',
    edgeSql: () => "' OR '1'='1' --",
    edgeXss: () => '<script>alert(1)</script>',
    edgeNullLike: (g) => g.pick(['null', 'undefined', 'NaN', 'None', 'true', '0']),
    edgeMaxInt: (g) => g.pick(['2147483647', '2147483648', '-2147483648', '9007199254740993'])
  };

  const GROUPS = [
    { name: 'Identity', types: [['firstName','First name'],['lastName','Last name'],['fullName','Full name'],['email','Email'],['username','Username'],['password','Password'],['dob','Date of birth']] },
    { name: 'Phone (follows country)', types: [['phone','Phone (matches country)'],['phoneE164','Phone E.164 (+CC12345678)'],['phoneNational','Phone national format'],['countryCode','Country code (+CC)']] },
    { name: 'Phone (specific country)', types: [['phoneBD','Bangladesh +880'],['phoneIN','India +91'],['phoneUS','United States +1'],['phoneCA','Canada +1'],['phoneUK','United Kingdom +44'],['phoneAU','Australia +61'],['phoneDE','Germany +49']] },
    { name: 'Address', types: [['street','Street'],['city','City'],['state','State / region'],['zip','ZIP / postal code'],['country','Country']] },
    { name: 'Work', types: [['company','Company'],['jobTitle','Job title']] },
    { name: 'Payment (test cards)', types: [['creditCard','Card number'],['cvv','CVV'],['expiry','Expiry (MM/YY)']] },
    { name: 'Web / tech', types: [['url','URL'],['ipv4','IPv4 (doc range)'],['uuid','UUID'],['colorHex','Color hex']] },
    { name: 'Numbers / dates', types: [['integer','Integer'],['decimal','Decimal'],['boolean','Boolean'],['date','Date'],['datetime','Date-time (ISO)'],['time','Time']] },
    { name: 'Text', types: [['word','Word'],['sentence','Sentence'],['paragraph','Paragraph']] },
    { name: 'Security payloads', types: SEC_DEFS.map((d) => [d[0], d[1]]).concat([['secAny', 'Any security payload (random)']]) },
    { name: 'Edge cases', types: [['edgeRandom','Random edge case'],['edgeEmpty','Empty string'],['edgeLong255','255 characters'],['edgeLong256','256 characters'],['edgeUnicode','Unicode'],['edgeEmoji','Emoji'],['edgeRTL','Right-to-left text'],['edgeSpecial','Special characters'],['edgeSpaces','Leading/trailing spaces'],['edgeSql','SQL-like input'],['edgeXss','Script-like input'],['edgeNullLike','Null-like text'],['edgeMaxInt','Integer limits']] }
  ];
  const PRESETS = {
    User: ['firstName','lastName','email','username','password','phone','dob'],
    Address: ['street','city','state','zip','country','phone'],
    Payment: ['fullName','creditCard','expiry','cvv'],
    Company: ['company','jobTitle','email','phone','url'],
    'Edge cases': ['edgeLong255','edgeUnicode','edgeEmoji','edgeSpecial','edgeSql','edgeXss','edgeSpaces','edgeNullLike']
  };

  function hash(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // make(seed?, country?) - seed is optional (used by tests); country '' = random per row
  function make(seed, country) {
    const hasSeed = seed !== undefined && seed !== null && String(seed).trim() !== '';
    const rand = hasSeed ? mulberry(hash(String(seed).trim())) : Math.random;
    const int = (a, b) => Math.floor(rand() * (b - a + 1)) + a;
    const pick = (arr) => arr[int(0, arr.length - 1)];
    const digits = (n) => Array.from({ length: n }, () => int(0, 9)).join('');
    const pad = (n, l = 2) => String(n).padStart(l, '0');
    const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const dateOff = (a, b) => { const d = new Date(); d.setDate(d.getDate() + int(a, b)); return d; };
    const slug = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const g = { int, pick, rand };
    const h = { int, pick, digits, pad };

    function base(ctx) {
      if (ctx.b) return ctx.b;
      const cn = COUNTRIES[country] ? country : pick(Object.keys(COUNTRIES));
      const first = pick(FIRST), last = pick(LAST), n = int(10, 9999);
      const [city, state, zip] = pick(COUNTRIES[cn].cities);
      const ph = PHONE[cn](h);
      return (ctx.b = { first, last, country: cn, dial: COUNTRIES[cn].dial, city, state, zip,
        phone: ph.intl, phoneE164: '+' + ph.intl.replace(/\D/g, ''), phoneNational: ph.national,
        company: `${pick(COMPANY)} ${pick(SUFFIX)}`,
        email: `${slug(first)}.${slug(last)}${n}@${pick(DOMAINS)}`,
        username: `${slug(first)}_${slug(last)}${n}`,
        street: `${int(1, 999)} ${pick(STREETS)}` });
    }
    const words = (n) => Array.from({ length: n }, () => pick(WORDS));
    const sentence = () => cap(words(int(6, 12)).join(' ')) + '.';
    const time = () => `${pad(int(0, 23))}:${pad(int(0, 59))}:${pad(int(0, 59))}`;

    const F = {
      firstName: (c) => base(c).first, lastName: (c) => base(c).last, fullName: (c) => `${base(c).first} ${base(c).last}`,
      email: (c) => base(c).email, username: (c) => base(c).username,
      phone: (c) => base(c).phone, phoneE164: (c) => base(c).phoneE164, phoneNational: (c) => base(c).phoneNational, countryCode: (c) => base(c).dial,
      dob: () => iso(dateOff(-65 * 365, -18 * 365)),
      password: () => {
        const U = 'ABCDEFGHJKLMNPQRSTUVWXYZ', L = 'abcdefghijkmnopqrstuvwxyz', D = '23456789', S = '!@#$%^&*', all = U + L + D + S;
        const secureIndex = (length) => {
          if (hasSeed || !globalThis.crypto || !globalThis.crypto.getRandomValues) return int(0, length - 1);
          const n = new Uint32Array(1);
          const limit = Math.floor(4294967296 / length) * length;
          do { globalThis.crypto.getRandomValues(n); } while (n[0] >= limit);
          return n[0] % length;
        };
        const securePick = (chars) => chars[secureIndex(chars.length)];
        const p = [securePick([...U]), securePick([...L]), securePick([...D]), securePick([...S])];
        while (p.length < 14) p.push(securePick([...all]));
        for (let i = p.length - 1; i > 0; i--) {
          const j = secureIndex(i + 1);
          [p[i], p[j]] = [p[j], p[i]];
        }
        return p.join('');
      },
      street: (c) => base(c).street, city: (c) => base(c).city, state: (c) => base(c).state, zip: (c) => base(c).zip, country: (c) => base(c).country,
      company: (c) => base(c).company, jobTitle: () => pick(JOBS),
      creditCard: () => pick(CARDS), cvv: () => digits(3),
      expiry: () => { const d = dateOff(365, 365 * 4); return `${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`; },
      url: () => `https://www.${pick(DOMAINS)}/${pick(WORDS)}`,
      ipv4: () => `${pick(['192.0.2', '198.51.100', '203.0.113'])}.${int(1, 254)}`,
      uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => { const r = int(0, 15); return (ch === 'x' ? r : (r & 3) | 8).toString(16); }),
      colorHex: () => '#' + int(0, 0xffffff).toString(16).padStart(6, '0'),
      integer: () => int(1, 1000), decimal: () => Math.round(rand() * 100000) / 100, boolean: () => rand() < 0.5,
      date: () => iso(dateOff(-1825, 365)), datetime: () => `${iso(dateOff(-365, 0))}T${time()}Z`, time,
      word: () => pick(WORDS), sentence, paragraph: () => Array.from({ length: int(3, 5) }, sentence).join(' ')
    };
    Object.keys(EDGE).forEach((k) => { F[k] = () => EDGE[k](g); });
    F.edgeRandom = () => F[pick(Object.keys(EDGE))]();
    SEC_DEFS.forEach((d) => { F[d[0]] = () => pick(d[2]); });
    F.secAny = () => pick(SEC_ALL);
    const CC2NAME = { BD: 'Bangladesh', IN: 'India', US: 'United States', CA: 'Canada', UK: 'United Kingdom', AU: 'Australia', DE: 'Germany' };
    Object.keys(CC2NAME).forEach((cc) => { F['phone' + cc] = () => '+' + PHONE[CC2NAME[cc]](h).intl.replace(/\D/g, ''); });

    // Edge cases per data type (boundaries, invalid formats, limits)
    const dates = ['1900-01-01', '1970-01-01', '2038-01-19', '9999-12-31', '2024-02-29', '2023-02-29', '0000-00-00', ''];
    const phones = ['', '0', '+', '12345', '+1234567890123456', '00000000000', '+880 1712 34567 ext 12', 'abcdefghij', '(555) 010-0100', '+0 000 000 0000'];
    const EBT = {
      email: ['a@b.co', 'user+tag@example.com', 'UPPER.CASE@EXAMPLE.COM', 'first.last@sub.domain.example.com', 'x'.repeat(64) + '@example.com', 'plainaddress', 'missing@domain', '@no-local.com', 'spaces in@example.com', ' leading@example.com', 'double@@example.com', ''],
      phone: phones, phoneE164: phones, phoneNational: phones,
      countryCode: ['', '+', '+0', '+9999', '880', '00880', '+1-684'],
      password: ['', 'a', '        ', 'Pass word 1!', '123456', 'password', 'a'.repeat(129), 'пароль12345!', '😀😀😀😀😀😀😀😀'],
      username: ['', 'a', 'user name', 'user@name', 'a'.repeat(65), 'ADMIN', 'ünïcödé', '____', '-leading', '123456'],
      dob: dates, date: dates,
      datetime: ['1970-01-01T00:00:00Z', '2038-01-19T03:14:08Z', '9999-12-31T23:59:59Z', '2024-02-29T12:00:00Z', '2023-02-29T12:00:00Z', '2024-13-01T00:00:00Z', ''],
      time: ['00:00:00', '23:59:59', '24:00:00', '12:60:00', '7:5', ''],
      zip: ['0', '00000', '99999-9999', 'ABCDE', '123', '1234567890', '   ', ''],
      creditCard: ['0000000000000000', '4242424242424241', '4242 4242 4242 4242', '42424242', 'abcdabcdabcdabcd', '4242424242424242424242', ''],
      cvv: ['0', '12', '12345', 'abc', '000', ''],
      expiry: ['00/00', '13/25', '01/20', '1/2', '12/99', ''],
      url: ['http://', 'https://', 'ftp://example.com', 'example.com', 'https://example.com/path with spaces', 'https://例え.jp', 'https://' + 'a'.repeat(63) + '.example.com', '//example.com', ''],
      ipv4: ['0.0.0.0', '255.255.255.255', '256.256.256.256', '999.1.1.1', '1.1.1', '::1', '192.168.1.1', ''],
      uuid: ['00000000-0000-0000-0000-000000000000', 'not-a-uuid', '12345678-1234-1234-1234-12345678901', ''],
      colorHex: ['#000', '#FFFFFF', '#GGGGGG', '000000', ''],
      integer: [0, -1, 1, 2147483647, '2147483648', -2147483648, '9007199254740993'],
      decimal: [0, -0.01, 0.005, 0.1 + 0.2, 99999999.999, -0],
      boolean: ['true', 'false', 'TRUE', '1', '0', 'yes', 'no', 'null', '']
    };

    Object.keys(CC2NAME).forEach((cc) => { EBT['phone' + cc] = phones; });

    g.value = (type, ctx) => { if (!F[type]) throw new Error('Unknown type: ' + type); return F[type](ctx || {}); };
    g.edge = (type, ctx) => (/^(edge|sec)/.test(type) ? g.value(type, ctx) : EBT[type] ? pick(EBT[type]) : F.edgeRandom());
    return g;
  }

  // opts: { mode: 'valid' | 'edge', country: '' | country name, seed?: string }
  function dataset(fields, count, opts) {
    opts = opts || {};
    const g = make(opts.seed, opts.country), rows = [];
    const secList = opts.mode === 'security' ? (SEC_BY_ID[opts.category] || SEC_ALL) : null;
    let si = 0;
    for (let i = 0; i < count; i++) {
      const ctx = {}, row = {};
      fields.forEach((f) => {
        let k = f.name, n = 2;
        while (k in row) k = `${f.name}_${n++}`;
        row[k] = secList ? secList[si++ % secList.length] : opts.mode === 'edge' ? g.edge(f.type, ctx) : g.value(f.type, ctx);
      });
      rows.push(row);
    }
    return rows;
  }

  function format(rows, fmt, table) {
    const cols = rows.length ? Object.keys(rows[0]) : [];
    if (fmt === 'lines') return rows.flatMap((r) => cols.map((c) => String(r[c]).replace(/\r/g, '\\r').replace(/\n/g, '\\n'))).join('\n');
    if (fmt === 'csv') {
      const esc = (v) => {
        let s = String(v);
        if (/^[=+\-@]|^\t|^\r/.test(s)) s = "'" + s;
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      return [cols.map(esc).join(',')].concat(rows.map((r) => cols.map((c) => esc(r[c])).join(','))).join('\n');
    }
    if (fmt === 'sql') {
      const id = (s) => String(s).replace(/\W/g, '_');
      const lit = (v) => (typeof v === 'number' ? String(v) : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : "'" + String(v).replace(/'/g, "''") + "'");
      return rows.map((r) => `INSERT INTO ${id(table || 'test_data')} (${cols.map(id).join(', ')}) VALUES (${cols.map((c) => lit(r[c])).join(', ')});`).join('\n');
    }
    if (fmt === 'text') return rows.map((r) => cols.map((c) => `${c}: ${r[c]}`).join('\n')).join('\n\n');
    return JSON.stringify(rows, null, 2);
  }

  const API = { SEC: SEC_DEFS.map((d) => ({ id: d[0], label: d[1], count: d[2].length })), SEC_TOTAL: SEC_ALL.length, GROUPS, PRESETS, COUNTRIES: Object.keys(COUNTRIES), make, dataset, format };
  root.TDG = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof self !== 'undefined' ? self : globalThis);
