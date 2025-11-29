let cfips = [
    // 在这里添加您的优选IP地址或优选域名，支持IPv4和IPv6
    // 格式: "IP地址:端口#备注"
    // 示例:
    "46.3.105.69:22899#🇭🇰HK",
    "saas.sin.fan:443#🇭🇰HK",
    "[2001:db8::1]:2083#SG"
];

let cfips_api = ['']; // api里的内容格式和{cfips}里相同

// Base64 encoding function
function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// Validate IPv4 address
function isValidIPv4(address) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(address);
}

// Validate domain name
function isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.length <= 253;
}

// Validate IPv6 address
function isValidIPv6(address) {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv6Regex.test(address);
}

// Process API addresses
async function organizeCFIPList(api) {
    if (!api || api.length === 0) return [];

    let newapi = "";

    // Create an AbortController object to control fetch request cancellation
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort(); // Cancel all requests
    }, 5000); // Trigger after 5 seconds

    try {
        // Use Promise.allSettled to wait for all API requests to complete, regardless of success or failure
        // Traverse the api array and initiate fetch requests for each API address
        const responses = await Promise.allSettled(api.map(apiUrl => fetch(apiUrl, {
            method: 'get',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;',
                'User-Agent': 'curl/7.79.1'
            },
            signal: controller.signal 
        }).then(response => response.ok ? response.text() : Promise.reject())));

        // Traverse all responses
        for (const [index, response] of responses.entries()) {
            // Check if the response status is 'fulfilled', i.e., the request was successfully completed
            if (response.status === 'fulfilled') {
                // Get the content of the response
                const content = await response.value;

                const lines = content.split(/\r?\n/);
                let nodeRemark = '';
                let speedPort = '443';

                if (lines[0].split(',').length > 3) {
                    const idMatch = api[index].match(/id=([^&]*)/);
                    if (idMatch) nodeRemark = idMatch[1];

                    const portMatch = api[index].match(/port=([^&]*)/);
                    if (portMatch) speedPort = portMatch[1];

                    for (let i = 1; i < lines.length; i++) {
                        const columns = lines[i].split(',')[0];
                        if (columns) {
                            newapi += `${columns}:${speedPort}${nodeRemark ? `#${nodeRemark}` : ''}\n`;
                        }
                    }
                } else {
                    // Add the content to newapi
                    newapi += content + '\n';
                }
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        // Regardless of success or failure, finally clear the set timeout timer
        clearTimeout(timeout);
    }

    const newAddressesapi = await organize(newapi);

    // Return the processed result
    return newAddressesapi;
}

// Process addresses function
async function organize(content) {
    var replacedContent = content.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');
    if (replacedContent.charAt(0) == ',') replacedContent = replacedContent.slice(1);
    if (replacedContent.charAt(replacedContent.length - 1) == ',') replacedContent = replacedContent.slice(0, replacedContent.length - 1);
    const addressArray = replacedContent.split(',');

    return addressArray;
}

// Frontend HTML page
const frontendHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preferred Subscription Generator</title>
    <style>
        :root {
            --primary-color: #4361ee;
            --hover-color: #3b4fd3;
            --bg-color: #f5f6fa;
            --card-bg: #ffffff;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            margin-bottom: 5px;
        }
        
        body {
            background: linear-gradient(135deg, rgb(182 191 232) 0%, rgb(146 217 221) 100%);
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-color: var(--bg-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            position: relative;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px); 
            max-width: 600px;
            width: 90%;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
        }

        .container:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        
        h1 {
            text-align: center;
            color: var(--primary-color);
            margin-bottom: 2rem;
            font-size: 1.8rem;
        }
        
        .input-group {
            // margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }
        
        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid rgba(0, 0, 0, 0.15);
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        input:focus, select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15),
                        inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }
        
        button {
            width: 100%;
            padding: 12px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 1.5rem;
        }
        
        button:hover {
            background-color: var(--hover-color);
            transform: translateY(-2px);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        #result {
            background-color: #f8f9fa;
            font-family: monospace;
            word-break: break-all;
            min-height: 40px;
        }

        .github-corner svg {
            fill: var(--primary-color);
            color: var(--card-bg);
            position: absolute;
            top: 0;
            right: 0;
            border: 0;
            width: 80px;
            height: 80px;
        }

        .github-corner:hover .octo-arm {
            animation: octocat-wave 560ms ease-in-out;
        }

        @keyframes octocat-wave {
            0%, 100% { transform: rotate(0) }
            20%, 60% { transform: rotate(-25deg) }
            40%, 80% { transform: rotate(10deg) }
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .logo-title {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2rem;
        }

        .logo-wrapper {
            position: absolute;
            left: 0;
            width: 50px;
            height: 50px;
        }

        .logo-title h1 {
            margin-bottom: 0;
            text-align: center;
        }

        @media (max-width: 480px) {
            .container {
                padding: 1.5rem;
            }
            
            h1 {
                font-size: 1.5rem;
            }

            .github-corner:hover .octo-arm {
                animation: none;
            }
            .github-corner .octo-arm {
                animation: octocat-wave 560ms ease-in-out;
            }

            .logo-wrapper {
                width: 40px;
                height: 40px;
            }
        }

        .beian-info {
            text-align: center;
            font-size: 13px;
        }

        .beian-info a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px dashed var(--primary-color);
            padding-bottom: 2px;
        }

        .beian-info a:hover {
            border-bottom-style: solid;
        }

        #qrcode {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            min-height: 0;
            transition: min-height 0.3s ease;
        }
        
        #qrcode.show {
            min-height: 180px; /* Adjusted from 220px to 180px for 160x160 QR code */
        }

        .info-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            font-size: 12px;
            margin-left: 8px;
            cursor: pointer;
            font-weight: bold;
            position: relative;
            top: -3px;
        }

        .info-tooltip {
            display: none;
            position: fixed;
            background: white;
            border: 1px solid var(--primary-color);
            border-radius: 8px;
            padding: 15px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-width: 200px;
            max-width: 45vw;
            width: max-content;
            left: 50%;
            top: 70%;
            transform: translate(-50%, -50%);
            margin: 0;
            line-height: 1.6;
            font-size: 13px;
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .info-tooltip::before {
            display: none;
        }
        
        .protocol-options {
            display: none;
            margin-top: 10px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
        }
        
        .protocol-options.show {
            display: block;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
    <a href="https://github.com/eooce" target="_blank" class="github-corner" aria-label="View source on Github">
        <svg viewBox="0 0 250 250" aria-hidden="true">
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
            <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
            <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
        </svg>
    </a>
    <div class="container">
        <div class="logo-title">
            <h1>优选订阅生成器</h1>
        </div>
        
        <div class="input-group">
            <label for="link">请输入节点链接</label>
            <input type="text" id="link" placeholder="请输入 vmess://  vless://  trojan://  ss://  节点链接">
        </div>
        
        <button onclick="generateLink()">生成优选订阅</button>
        
        <div class="input-group">
            <div style="display: flex; align-items: center;">
                <label for="result">优选订阅</label>
                <div style="position: relative;">
                    <span class="info-icon" onclick="toggleTooltip(event)">!</span>
                    <div class="info-tooltip" id="infoTooltip">
                        <strong>Security Notice</strong>: When using the preferred subscription generator, you need to submit <strong>node configuration information</strong> to generate preferred subscription links.<br><br>
                        Please use at your own risk.
                    </div>
                </div>
            </div>
            <input type="text" id="result" readonly onclick="copyToClipboard()">
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button onclick="generateQRCode()" style="flex: 1;">点击生成二维码</button>
            </div>
            <div id="qrcode" style="margin: 1px;"></div>
        </div>
        <div class="beian-info" style="text-align: center; font-size: 13px;">
            <a href="https://t.me/eooceu" target="_blank">老王技术交流分享群</a>
        </div>
    </div>

    <script>
        function toggleTooltip(event) {
            event.stopPropagation();
            const tooltip = document.getElementById('infoTooltip');
            tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
        }
        
        // Click outside to close tooltip
        document.addEventListener('click', function(event) {
            const tooltip = document.getElementById('infoTooltip');
            const infoIcon = document.querySelector('.info-icon');
            
            if (!tooltip.contains(event.target) && !infoIcon.contains(event.target)) {
                tooltip.style.display = 'none';
            }
        });

        function copyToClipboard() {
            const resultInput = document.getElementById('result');
            if (!resultInput.value) {
                return;
            }
            
            resultInput.select();
            navigator.clipboard.writeText(resultInput.value).then(() => {
                const tooltip = document.createElement('div');
                tooltip.style.position = 'fixed';
                tooltip.style.left = '50%';
                tooltip.style.top = '20px';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.padding = '8px 16px';
                tooltip.style.background = '#0dc690';
                tooltip.style.color = 'white';
                tooltip.style.borderRadius = '4px';
                tooltip.style.zIndex = '1000';
                tooltip.textContent = '链接复制成功';
                
                document.body.appendChild(tooltip);
                
                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 2000);
            }).catch(err => {
                alert('Copy failed, please copy manually');
            });
        }

        function generateLink() {
            const link = document.getElementById('link').value;
            if (!link) {
                alert('Please enter node link');
                return;
            }
            
            let subLink = '';
            try {
                // For all link types, pass the entire link to the backend
                const domain = window.location.hostname;
                subLink = 'https://' + domain + '/sub?link=' + encodeURIComponent(link);
                document.getElementById('result').value = subLink;
                
                // Hide QR code container until user clicks "Generate QR Code"
                const qrcodeDiv = document.getElementById('qrcode');
                qrcodeDiv.classList.remove('show');
                qrcodeDiv.innerHTML = '';
            } catch (error) {
                alert('Error generating link, please check input');
            }
        }
        
        function generateQRCode() {
            const subLink = document.getElementById('result').value;
            if (!subLink) {
                alert('Please generate subscription link first');
                return;
            }
            
            // Show and update QR code
            const qrcodeDiv = document.getElementById('qrcode');
            qrcodeDiv.innerHTML = '';
            qrcodeDiv.classList.add('show');
            
            // Use the new QRCode library with custom size and color
            new QRCode(qrcodeDiv, {
                text: subLink,
                width: 160,
                height: 160,
                colorDark: "black",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    </script>
</body>
</html>
`;

// Main handler function
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // Return frontend page for root path
        if (url.pathname === '/') {
            return new Response(frontendHtml, {
                headers: {
                    "content-type": "text/html; charset=utf-8",
                },
            });
        }
        
        // Handle /sub path as well as root path for API requests
        if (url.pathname !== '/' && url.pathname !== '/sub') {
            return new Response('Not Found', {
                status: 404,
                headers: {
                    "content-type": "text/plain; charset=utf-8",
                },
            });
        }
        
        // Return CORS headers for OPTIONS requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }
        
        let host = "";
        let uuid = "";
        let path = "";
        let sni = "";
        let type = "ws";
        let protocolType = 'VLESS'; 
        let security = 'tls';
        let encryption = 'none';
        let transportLayerProtocol = 'tcp';
        
        // Extract information from query parameters
        host = url.searchParams.get('host') || "";
        uuid = url.searchParams.get('uuid') || url.searchParams.get('password') || url.searchParams.get('pw') || "";
        path = url.searchParams.get('path') || "/?ed=2560";
        sni = url.searchParams.get('sni') || host;
        type = url.searchParams.get('type') || type;
        security = url.searchParams.get('security') || security;
        encryption = url.searchParams.get('encryption') || encryption;
        transportLayerProtocol = url.searchParams.get('headerType') || transportLayerProtocol;
        
        // Check protocol type parameter
        const protocolParam = url.searchParams.get('protocol');
        if (protocolParam) {
            if (protocolParam === 'vmess') {
                protocolType = 'VMess';
            } else if (protocolParam === 'trojan') {
                protocolType = 'Trojan';
            } else if (protocolParam === 'ss') {
                protocolType = 'SS';
            } else {
                protocolType = protocolParam.toUpperCase();
            }
        }
        
        // Check if it's a Shadowsocks link
        if (url.searchParams.has('plugin') && url.searchParams.get('plugin').includes('v2ray-plugin')) {
            protocolType = 'SS';
            // Extract host and path from plugin parameter
            const pluginParam = url.searchParams.get('plugin');
            if (pluginParam) {
                // Extract host
                const hostMatch = pluginParam.match(/host%3D([^;]+)/);
                if (hostMatch) {
                    host = decodeURIComponent(hostMatch[1]);
                }
                // Extract path
                const pathMatch = pluginParam.match(/path%3D([^;]+)/);
                if (pathMatch) {
                    path = decodeURIComponent(pathMatch[1]);
                }
            }
            
            // Check if uuid parameter is Base64 encoded "method:password" format
            const uuidParam = url.searchParams.get('uuid');
            if (uuidParam) {
                try {
                    const decodedUuid = atob(uuidParam);
                    if (decodedUuid.includes(':')) {
                        const [method, password] = decodedUuid.split(':');
                        encryption = method || 'none';
                        uuid = password || uuid;
                    }
                } catch (e) {
                    console.log('uuid parameter is not Base64 encoded');
                }
            }
        }
        
        // Check if it's an XHTTP link
        let mode = ""; // Add mode variable for XHTTP
        if (url.searchParams.has('type') && url.searchParams.get('type') === 'xhttp' && url.searchParams.has('security') && url.searchParams.get('security') === 'tls') {
            protocolType = 'XHTTP';
            mode = url.searchParams.get('mode') || "packet-up"; 
        }
        
        // Check if required parameters are missing
        if (!host || !uuid) {
            // If we don't have host/uuid, check if this is a link conversion request
            const linkParam = url.searchParams.get('link');
            if (linkParam) {
                try {
                    if (linkParam.startsWith('vmess://')) {
                        const vmessLink = linkParam.split('vmess://')[1];
                        const vmessJson = JSON.parse(atob(vmessLink));
                        
                        host = vmessJson.host || vmessJson.add;
                        uuid = vmessJson.id;
                        path = vmessJson.path || '/';
                        sni = vmessJson.sni || host;
                        type = vmessJson.net || 'ws'; // Use net field for type, default to 'ws'
                        security = vmessJson.tls === true || vmessJson.tls === 'true' || vmessJson.tls === 'tls' ? 'tls' : 'none';
                        encryption = vmessJson.scy || 'auto';
                        protocolType = 'VMess';
                    } else if (linkParam.startsWith('vless://')) {
                        // Parse VLESS link
                        // Split by ? to separate URL part and parameters
                        const [urlPart, paramsPart] = linkParam.split('?');
                        
                        // Extract UUID and host from URL part
                        const urlWithoutProtocol = urlPart.substring(8); 
                        const [uuidAndHostPart, tagPart] = urlWithoutProtocol.split('#'); // Split by # to separate tag
                        const [uuidPart, hostAndPortPart] = uuidAndHostPart.split('@');
                        
                        uuid = decodeURIComponent(uuidPart);
                        const originalHost = hostAndPortPart.split(':')[0]; // Store original host
                        protocolType = 'VLESS';
                        
                        // Parse query parameters
                        if (paramsPart) {
                            // Remove the tag part if it exists after parameters
                            const cleanParamsPart = paramsPart.split('#')[0];
                            const params = new URLSearchParams(cleanParamsPart);
                            path = params.get('path') || '/';
                            sni = params.get('sni') || originalHost;
                            type = params.get('type') || 'ws';
                            security = params.get('security') || 'tls';
                            host = params.get('host') || originalHost;
                            
                            // Check for XHTTP protocol with mode parameter
                            if (type === 'xhttp' && (params.get('mode') === 'packet-up' || params.get('mode') === 'stream-one')) {
                                protocolType = 'XHTTP';
                                mode = params.get('mode'); 
                            }
                        } else {
                            // Set default values if no parameters
                            path = '/';
                            sni = originalHost;
                            type = 'ws';
                            security = 'tls';
                            host = originalHost;
                        }
                    } else if (linkParam.startsWith('trojan://')) {
                        // Parse Trojan link
                        // Split by ? to separate URL part and parameters
                        const [urlPart, paramsPart] = linkParam.split('?');
                        
                        // Extract UUID and host from URL part
                        const urlWithoutProtocol = urlPart.substring(9); 
                        const [uuidAndHostPart, tagPart] = urlWithoutProtocol.split('#'); // Split by # to separate tag
                        const [uuidPart, hostAndPortPart] = uuidAndHostPart.split('@');
                        
                        uuid = decodeURIComponent(uuidPart);
                        const originalHost = hostAndPortPart.split(':')[0]; // Store original host
                        protocolType = 'Trojan';
                        
                        // Parse query parameters
                        if (paramsPart) {
                            // Remove the tag part if it exists after parameters
                            const cleanParamsPart = paramsPart.split('#')[0];
                            const params = new URLSearchParams(cleanParamsPart);
                            path = params.get('path') || '/';
                            sni = params.get('sni') || originalHost;
                            type = params.get('type') || 'ws';
                            security = params.get('security') || 'tls';
                            host = params.get('host') || originalHost;
                        } else {
                            // Set default values if no parameters
                            path = '/';
                            sni = originalHost;
                            type = 'ws';
                            security = 'tls';
                            host = originalHost;
                        }
                    } else if (linkParam.startsWith('ss://')) {
                        // Parse Shadowsocks link
                        protocolType = 'SS';
                        
                        // Shadowsocks format: ss://base64(method:password)@server:port#tag
                        // Or with plugin: ss://base64(method:password)@server:port?plugin=...#tag
                        
                        // First, separate the base64 part from the rest
                        const linkWithoutPrefix = linkParam.substring(5); // Remove 'ss://'
                        let ssLink = '';
                        let hostPortAndParams = '';
                        
                        // Find the @ separator
                        const atIndex = linkWithoutPrefix.indexOf('@');
                        if (atIndex > 0) {
                            ssLink = linkWithoutPrefix.substring(0, atIndex);
                            hostPortAndParams = linkWithoutPrefix.substring(atIndex + 1);
                        }
                        
                        // Extract tag if present
                        let tag = '';
                        if (hostPortAndParams.includes('#')) {
                            const parts = hostPortAndParams.split('#');
                            hostPortAndParams = parts[0];
                            tag = decodeURIComponent(parts[1]);
                        }
                        
                        // Extract plugin parameter if present
                        let pluginParam = '';
                        if (hostPortAndParams.includes('?plugin=')) {
                            const pluginStart = hostPortAndParams.indexOf('?plugin=');
                            pluginParam = hostPortAndParams.substring(pluginStart + 1);
                            hostPortAndParams = hostPortAndParams.substring(0, pluginStart);
                        }
                        
                        if (hostPortAndParams) {
                            // Extract host and port
                            const hostPortParts = hostPortAndParams.split(':');
                            host = hostPortParts[0];
                            
                            // Decode the base64 part to get method and password
                            try {
                                const decodedUserInfo = atob(ssLink);
                                const [method, password] = decodedUserInfo.split(':');
                                encryption = method;
                                uuid = password;
                            } catch (e) {
                                console.error('Base64 decode error:', e);
                                // If base64 decode fails, try to parse as method:password directly
                                const [method, password] = ssLink.split(':');
                                encryption = method;
                                uuid = password;
                            }
                            
                            // For Shadowsocks with plugin, we need to extract more info
                            if (pluginParam) {
                                // Extract path, host, etc. from plugin param
                                const pluginDecoded = decodeURIComponent(pluginParam.replace('plugin=', ''));
                                const pluginParts = pluginDecoded.split(';');
                                
                                // Look for path and host in plugin parameters
                                for (const part of pluginParts) {
                                    if (part.startsWith('path=')) {
                                        path = decodeURIComponent(part.substring(5));
                                    } else if (part.startsWith('host=')) {
                                        sni = decodeURIComponent(part.substring(5));
                                    }
                                }
                                
                                // Save the plugin parameter for link generation
                                // We need to store it in a way that it's accessible later
                                url.shadowsocksPluginParam = pluginParam;
                            }
                            
                            // Set defaults if not extracted from plugin
                            if (!path) path = '/';
                            if (!sni) sni = host;
                            type = 'ws';
                            security = 'tls';
                        }
                    }
                } catch (e) {
                    console.error('Error parsing link:', e);
                    const responseText = `
Error parsing link. Please check the link format.
                    
Supported link formats:
- VLESS: vless://uuid@host:port?...
- VMess: vmess://base64encoded_json
- Trojan: trojan://password@host:port?...
- Shadowsocks: ss://base64(method:password)@host:port?...
                    `;
                    
                    return new Response(responseText, {
                        status: 400,
                        headers: { 'content-type': 'text/plain; charset=utf-8' },
                    });
                }
            } else {
                const responseText = `
Missing required parameters: host and uuid

Example link:
${url.origin}/sub?host=example.com&uuid=your-uuid&path=/your-path

Or provide a node link:
${url.origin}/sub?link=your_node_link_here

Supported protocols:
- VLESS WebSocket TLS: vless-ws-tls
- VLESS XHTTP TLS: vless-xhttp-tls
- VMess WebSocket TLS: vmess-ws-tls
- Trojan WebSocket TLS: trojan-ws-tls
- Shadowsocks WebSocket TLS: ss-ws-tls

For Shadowsocks links, use the link parameter:
${url.origin}/sub?link=ss://base64_encoded_link_here
                `;
                
                return new Response(responseText, {
                    status: 202,
                    headers: { 'content-type': 'text/plain; charset=utf-8' },
                });
            }
        }
        
        // Process addresses in cfips and cfips_api
        let allAddresses = [...cfips];
        
        // Add addresses from cfips_api if it's not empty
        if (cfips_api && cfips_api.length > 0) {
            try {
                const apiAddresses = await organizeCFIPList(cfips_api);
                // Add valid addresses to allAddresses
                allAddresses = [...allAddresses, ...apiAddresses];
            } catch (error) {
                console.error('Error processing cfips_api:', error);
            }
        }
        
        // Generate node links
        const nodeLinks = allAddresses.map(addressInfo => {
            let addressPart, portPart, addressid = '';
            
            // Handle IPv6 addresses which may be enclosed in brackets
            if (addressInfo.startsWith('[') && addressInfo.includes(']:')) {
                // IPv6 with port: [2001:db8::1]:8080#tag
                const endIndex = addressInfo.indexOf(']:');
                addressPart = addressInfo.substring(1, endIndex); // Extract IPv6 without brackets
                const remaining = addressInfo.substring(endIndex + 2); // Everything after ]:
                [portPart, addressid] = remaining.split('#');
            } else if (addressInfo.includes('#') && addressInfo.split(':')[2]) {
                // IPv6 with tag but no port: 2001:db8::1#tag
                const parts = addressInfo.split('#');
                addressPart = parts[0];
                addressid = parts[1];
                portPart = '443'; // Default port for IPv6
            } else if (addressInfo.split(':').length > 2) {
                // IPv6 without tag: 2001:db8::1 or 2001:db8::1:8080
                // This is tricky because IPv6 contains multiple colons
                // We'll assume if it's a valid IPv6, it doesn't have a port
                const potentialIPv6 = addressInfo.includes('#') ? addressInfo.split('#')[0] : addressInfo;
                if (isValidIPv6(potentialIPv6)) {
                    addressPart = potentialIPv6;
                    portPart = '443'; // Default port for IPv6
                    if (addressInfo.includes('#')) {
                        addressid = addressInfo.split('#')[1];
                    }
                } else {
                    // Handle IPv4 or domain with port
                    let [addrPart, pPart] = addressInfo.split(':');
                    addressPart = addrPart;
                    if (pPart.includes('#')) {
                        [portPart, addressid] = pPart.split('#');
                    } else {
                        portPart = pPart;
                    }
                }
            } else {
                // Standard IPv4 or domain format: ip:port#tag or ip#tag
                let parts = addressInfo.split(':');
                addressPart = parts[0];
                
                if (parts.length > 1) {
                    if (parts[1].includes('#')) {
                        [portPart, addressid] = parts[1].split('#');
                    } else {
                        portPart = parts[1];
                    }
                }
            }
            
            // Set default port if not specified
            if (!portPart) {
                portPart = '443';
            }
            
            // If addressid is not specified, use part of the address as identifier
            if (!addressid) {
                // Check if addressPart contains a tag (in case of format "ip#tag")
                if (addressPart.includes('#')) {
                    const [ip, tag] = addressPart.split('#');
                    addressPart = ip;
                    addressid = tag;
                } else {
                    // Use different identifier based on whether it's an IP or domain
                    if (isValidIPv4(addressPart)) {
                        addressid = addressPart.split('.').slice(-1)[0]; // Use last segment as identifier for IPv4
                    } else if (isValidIPv6(addressPart)) {
                        // For IPv6, use first segment as identifier
                        addressid = addressPart.split(':')[0] || 'ipv6';
                    } else if (isValidDomain(addressPart)) {
                        // For domains, use the first part as identifier
                        addressid = addressPart.split('.')[0];
                    } else {
                        // Fallback for other cases
                        addressid = addressPart.substring(0, 8);
                    }
                }
            }
            
            if (!addressid) {
                addressid = 'CF随机优选';
            }
            
            // Generate different links based on protocol type
            try {
                if (protocolType === 'VLESS') {
                    return `vless://${uuid}@${addressPart}:${portPart}?encryption=${encryption}&security=${security}&sni=${sni}&type=${type}&host=${host}&path=${encodeURIComponent(path)}&fp=chrome#${encodeURIComponent(addressid)}`;
                } else if (protocolType === 'VMess') {
                    const vmessObj = {"v": "2","ps": addressid,"add": addressPart,"port": portPart,"id": uuid,"aid": "0","scy": "auto","net": type,"type": "none","host": host,"path": path,"tls": security,"sni": sni,"fp": "chrome"};
                    return `vmess://${utf8ToBase64(JSON.stringify(vmessObj))}`;
                } else if (protocolType === 'Trojan') {
                    return `trojan://${uuid}@${addressPart}:${portPart}?security=${security}&type=${type}&host=${host}&path=${encodeURIComponent(path)}&sni=${sni}&fp=chrome#${encodeURIComponent(addressid)}`;
                } else if (protocolType === 'SS') {
                    // Shadowsocks link format: ss://BASE64(method:password)@server:port#name
                    const ssUserInfo = `${encryption}:${uuid}`;
                    const encodedUserInfo = btoa(ssUserInfo);
                    // Check if plugin is needed
                    if (url.shadowsocksPluginParam) {
                        // Use the plugin parameter as-is without URL encoding
                        return `ss://${encodedUserInfo}@${addressPart}:${portPart}?${url.shadowsocksPluginParam}#${encodeURIComponent(addressid)}`;
                    } else if (url.searchParams.has('plugin')) {
                        // For direct parameter usage
                        const directPluginParam = url.searchParams.get('plugin');
                        // Use the plugin parameter as-is without URL encoding
                        return `ss://${encodedUserInfo}@${addressPart}:${portPart}?${directPluginParam}#${encodeURIComponent(addressid)}`;
                    } else {
                        // console.log('No plugin parameter found, using default SS link format');
                    }
                } else if (protocolType === 'XHTTP') {
                    // For XHTTP, include mode parameter if it exists
                    let xhttpLink = `vless://${uuid}@${addressPart}:${portPart}?encryption=${encryption}&security=${security}&type=${type}&sni=${sni}&host=${host}&path=${encodeURIComponent(path)}&fp=chrome`;
                    if (mode) {
                        xhttpLink += `&mode=${mode}`;
                    }
                    return `${xhttpLink}#${encodeURIComponent(addressid)}`;
                } else {
                    // Default to VLESS
                    return `vless://${uuid}@${addressPart}:${portPart}?encryption=${encryption}&security=${security}&sni=${sni}&type=${type}&host=${host}&path=${encodeURIComponent(path)}&fp=chrome#${encodeURIComponent(addressid)}`;
                }
            } catch (error) {
                console.error('Error generating node link:', error);
                return '';
            }
        }).filter(link => link !== ''); 
            
        // Check if there are valid node links
        if (nodeLinks.length === 0) {
            return new Response('Failed to generate any valid node links', {
                status: 500,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            });
        }
        
        // Join all links with newlines
        const allLinks = nodeLinks.join('\n');
        
        // Base64 encode
        let base64Links;
        try {
            base64Links = btoa(allLinks);
        } catch (error) {
            console.error('Error during Base64 encoding:', error);
            return new Response('Base64 encoding failed', {
                status: 500,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            });
        }
        
        // Return response
        return new Response(base64Links, {
            headers: {
                "content-type": "text/plain; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }
};

