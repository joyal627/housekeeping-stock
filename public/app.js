// Housekeeping Stock Count Application
(function () {
  const languageSelect = document.getElementById('languageSelect');
  let currentLanguage = ['en', 'hi'].includes(localStorage.getItem('hk_language'))
    ? localStorage.getItem('hk_language') : 'en';
  document.documentElement.lang = currentLanguage;

  const hindi = {
    'Language':'भाषा','Housekeeping Stock Count':'हाउसकीपिंग स्टॉक गणना',
    'Count supplies on schedule and get reminded when a count is due.':'निर्धारित समय पर सामान की गिनती करें और अगली गिनती का रिमाइंडर पाएं।',
    'Zero Stock Report':'शून्य स्टॉक रिपोर्ट','Alerts & Settings':'अलर्ट और सेटिंग्स',
    'Add to Phone':'फोन में जोड़ें','Guest Amenities Warning:':'अतिथि सुविधाओं की चेतावनी:',
    'Total stock (min 500)':'कुल स्टॉक (न्यूनतम 500)','Items tracked':'ट्रैक किए गए आइटम',
    'To count now':'अभी गिनती करनी है','AI Rooming Sheet Reader':'AI रूमिंग शीट रीडर',
    'Upload the daily rooming-sheet image. Check every extracted room/status before confirming stock deduction.':'रोज़ की रूमिंग शीट की तस्वीर अपलोड करें। स्टॉक घटाने की पुष्टि से पहले हर कमरे और स्थिति की जाँच करें।',
    'AI Scan (Camera)':'AI स्कैन (कैमरा)','Upload Image':'तस्वीर अपलोड करें','Read Image (AI)':'तस्वीर पढ़ें (AI)',
    'No image processed.':'अभी कोई तस्वीर प्रोसेस नहीं हुई।','Confirm & Deduct Stock':'पुष्टि करें और स्टॉक घटाएँ',
    'Back':'वापस','Print':'प्रिंट','Share Report':'रिपोर्ट साझा करें','Download CSV':'CSV डाउनलोड करें',
    'Stock Alerts & Settings':'स्टॉक अलर्ट और सेटिंग्स','Browser / Phone Notifications':'ब्राउज़र / फोन नोटिफिकेशन',
    'Checking...':'जाँच हो रही है...','Get instant alerts when Guest Amenities drop below 500 or when cleaning supplies run out.':'अतिथि सुविधाओं का स्टॉक 500 से कम होने या सफाई का सामान खत्म होने पर तुरंत अलर्ट पाएं।',
    'Turn On Browser Alerts':'ब्राउज़र अलर्ट चालू करें','Test Alert & Sound':'अलर्ट और आवाज़ जाँचें',
    'In-App Warning Chime & Sound':'ऐप में चेतावनी की आवाज़','Play warning sound for zero & low stock':'शून्य और कम स्टॉक पर चेतावनी की आवाज़ चलाएँ',
    'How to Enable in Phone / Browser Settings':'फोन / ब्राउज़र सेटिंग्स में कैसे चालू करें',
    'If notifications are blocked or not appearing, follow these simple steps to turn them on in your phone:':'यदि नोटिफिकेशन ब्लॉक हैं या दिखाई नहीं दे रहे हैं, तो उन्हें चालू करने के लिए ये चरण अपनाएँ:',
    'Android (Chrome)':'Android (Chrome)','iPhone (Safari)':'iPhone (Safari)','PC / Mac':'PC / Mac',
    'Done':'हो गया','Add to Phone Home Screen':'फोन की होम स्क्रीन पर जोड़ें',
    'Install Housekeeping App Now':'हाउसकीपिंग ऐप अभी इंस्टॉल करें','Android':'Android','iPhone / iPad':'iPhone / iPad','Laptop / PC':'लैपटॉप / PC',
    'Save count':'गिनती सेव करें','Reset':'रीसेट','Count needed':'गिनती आवश्यक','Not counted yet':'अभी गिनती नहीं हुई',
    'Counted':'गिनती पूरी','Cleaning supplies':'सफाई का सामान','Chemical supplies':'रासायनिक सामान','Guest amenities':'अतिथि सुविधाएँ',
    'pcs':'नग','boxes':'डिब्बे','Great! No items currently have 0 stock.':'बहुत अच्छा! किसी भी आइटम का स्टॉक शून्य नहीं है।',
    'Not counted yet':'अभी गिनती नहीं हुई','Out of Stock (0)':'स्टॉक खत्म (0)',
    'Report Date:':'रिपोर्ट की तारीख:','Items with 0 or uncounted stock:':'शून्य या बिना गिनती वाले आइटम:',
    'Item Name':'आइटम का नाम','Category':'श्रेणी','Current Count':'मौजूदा गिनती','Status':'स्थिति',
    'All supplies counted! Stock levels are sufficient.':'सभी सामान की गिनती हो गई! स्टॉक पर्याप्त है।',
    'Count needed':'गिनती आवश्यक','Not counted yet':'अभी गिनती नहीं हुई','Click to view':'देखने के लिए क्लिक करें',
    'Please select a rooming-sheet image.':'कृपया रूमिंग शीट की तस्वीर चुनें।',
    'Please upload a JPG, PNG, or WEBP image.':'कृपया JPG, PNG या WEBP तस्वीर अपलोड करें।',
    'Image is too large. Please upload an image under 7 MB.':'तस्वीर बहुत बड़ी है। कृपया 7 MB से छोटी तस्वीर अपलोड करें।',
    'AI is reading the rooming sheet image…':'AI रूमिंग शीट की तस्वीर पढ़ रहा है…',
    'Checking stock and processing deduction…':'स्टॉक जाँचा जा रहा है और कटौती की जा रही है…',
    'Resolve unclear rows before confirming.':'पुष्टि से पहले अस्पष्ट पंक्तियों को ठीक करें।',
    'No eligible rooms found. A CK IN room must have an ETA time.':'कोई योग्य कमरा नहीं मिला। CK IN कमरे के लिए ETA समय आवश्यक है।',
    'Confirm supply deduction for ':'इन कमरों के लिए सामान की कटौती की पुष्टि करें: ',
    ' rooms?':' कमरे?',
    'Stock deduction completed for ':'इन कमरों के लिए स्टॉक कटौती पूरी हुई: ',
    ' rooms. Available stock has been updated.':' कमरे। उपलब्ध स्टॉक अपडेट कर दिया गया है।',
    'Deduction stopped. Stock shortage found; no items were deducted.':'कटौती रोक दी गई। स्टॉक कम है; कोई भी आइटम नहीं घटाया गया।',
    'Deduction failed: ':'कटौती विफल: ','No stock available for ':'स्टॉक उपलब्ध नहीं है: ',
    'Stock shortage: ':'स्टॉक की कमी: ','Saved':'सेव हो गया','Processing…':'प्रोसेस हो रहा है…',
    'Image ready. Tap Read Image (AI).':'तस्वीर तैयार है। Read Image (AI) दबाएँ।',
    'AI Rooming Sheet Reader - Review':'AI रूमिंग शीट रीडर - समीक्षा',
    'Errors only':'केवल त्रुटियाँ','Show all rooms':'सभी कमरे दिखाएँ','issue':'समस्या','issues':'समस्याएँ',
    'found — fix before confirming.':'मिलीं — पुष्टि से पहले ठीक करें।','Error rows shown below.':'त्रुटि वाली पंक्तियाँ नीचे दिखाई गई हैं।',
    'All rows OK':'सभी पंक्तियाँ ठीक हैं','no issues found.':'कोई समस्या नहीं मिली।','Total:':'कुल:',
    'rows':'पंक्तियाँ','rooms':'कमरे','ROOMS column: ':'कमरों का कॉलम: ',' | Detected: ':' | पहचाने गए: ',
    '• Count matches':'• गिनती मेल खाती है','ℹ Count close (':'ℹ गिनती लगभग सही (',' rooms detected)':' कमरे पहचाने गए)',
    '⚠ COUNT MISMATCH — check room numbers':'⚠ गिनती मेल नहीं खाती — कमरे के नंबर जाँचें',
    'Detected rooms: ':'पहचाने गए कमरे: ','Rooms (':'कमरे (','Room(s)':'कमरा/कमरे',
    'ETA / Check-in:':'ETA / चेक-इन:','No time found':'समय नहीं मिला',
    'No issues — all rows look good!':'कोई समस्या नहीं — सभी पंक्तियाँ सही हैं!',
    'AI image reading failed: ':'AI तस्वीर पढ़ने में विफल: ',
    'DEDUCTION UNSUCCESSFUL — STOCK SHORTAGE':'कटौती विफल — स्टॉक की कमी',
    'No product stock was deducted.':'किसी भी सामान का स्टॉक नहीं घटाया गया।',
    'Stock shortages:':'स्टॉक की कमी:','Required:':'आवश्यक:','Available:':'उपलब्ध:','Short:':'कम:',
    'Deduction unsuccessful: no stock was deducted.':'कटौती विफल: कोई स्टॉक नहीं घटाया गया।',
    'STOCK SUCCESSFULLY DEDUCTED':'स्टॉक सफलतापूर्वक घटाया गया',
    'Rooms: ':'कमरे: ','Total deducted:':'कुल घटाया गया:','Deduction complete':'कटौती पूरी हुई',
    'Stock was NOT deducted.':'स्टॉक नहीं घटाया गया।',
    'Please check and save the required stock counts, then try again.':'कृपया आवश्यक स्टॉक की गिनती जाँचकर सेव करें और फिर कोशिश करें।',
    'Please enter a valid count number (0 or higher).':'कृपया सही गिनती दर्ज करें (0 या उससे अधिक)।',
    'Server error':'सर्वर त्रुटि','Are you sure you want to reset the count for ':'क्या आप इस आइटम की गिनती रीसेट करना चाहते हैं: ',
    'count cannot exceed':'की गिनती इससे अधिक नहीं हो सकती','Please check your stock carefully!':'कृपया अपने स्टॉक की सावधानी से जाँच करें!',
    'Count cannot be 1000 or more (Maximum allowed is 999).':'गिनती 1000 या उससे अधिक नहीं हो सकती (अधिकतम 999)।',
    'No available stock to deduct.':'घटाने के लिए कोई स्टॉक उपलब्ध नहीं है।',
    'AI response was not valid JSON. Please upload a clearer image.':'AI का जवाब सही JSON नहीं है। कृपया अधिक स्पष्ट तस्वीर अपलोड करें।',
    'This room-list batch was already processed.':'इस कमरे की सूची पर पहले ही कार्रवाई हो चुकी है।',
    'Unknown room: ':'अज्ञात कमरा: ','Inventory item missing: ':'इन्वेंटरी आइटम नहीं मिला: ',

    "AI API key is not configured. Please set GEMINI_API_KEY (or OPENAI_API_KEY) in server environment variables.": "AI API key कॉन्फ़िगर नहीं है। सर्वर environment variables में GEMINI_API_KEY (या OPENAI_API_KEY) सेट करें।",
    "Image is too large. Please upload a smaller JPG or PNG.": "तस्वीर बहुत बड़ी है। कृपया छोटी JPG या PNG तस्वीर अपलोड करें।",
    "Please upload a valid JPG, PNG, or WEBP image under 7 MB.": "कृपया 7 MB से छोटी सही JPG, PNG या WEBP तस्वीर अपलोड करें।",
    "AI image reading failed.": "AI तस्वीर पढ़ने में विफल रहा।",
    "AI review failed.": "AI समीक्षा विफल रही।",
    "Image ready. AI reading-in Read Image button click cheyyuka.": "Image ready. Tap Read Image (AI).",
    "ERROR: ": "त्रुटि: ",
    "count cannot exceed": "की गिनती इससे अधिक नहीं हो सकती",
    "Stock count carefully check cheyyuka. 1000 allenkil athil kooduthal aakaruthu (maximum 999).": "कृपया स्टॉक ध्यान से जाँचें। गिनती 1000 या उससे अधिक नहीं हो सकती (अधिकतम 999)।",
    "Are you sure you want to reset the count for ": "क्या आप इस आइटम की गिनती रीसेट करना चाहते हैं: ",
    "DEDUCTION UNSUCCESSFUL — STOCK SHORTAGE": "कटौती विफल — स्टॉक की कमी",
    "Oru item-il ninnum stock deduct cheythittilla.": "किसी भी आइटम का स्टॉक नहीं घटाया गया।",
    "Stock shortages:": "स्टॉक की कमी:",
    "Stock shortage undu. Onnum deduct cheythittilla. ": "स्टॉक की कमी है। कोई भी स्टॉक नहीं घटाया गया। ",
    "DEDUCTION STOPPED — STOCK SHORTAGE": "कटौती रोक दी गई — स्टॉक की कमी",
    "STOCK SUCCESSFULLY DEDUCTED": "स्टॉक सफलतापूर्वक घटाया गया",
    "Rooms: ": "कमरे: ",
    "Total deducted:": "कुल घटाया गया:",
    "Deduction complete": "कटौती पूरी हुई",
    "Process cheyyunnu…": "प्रोसेस हो रहा है…",
    "Chrome-ൽ മുകൾ ഭാഗത്തുള്ള വെബ്സൈറ്റ് URL-ന് ഇടത് വശത്തുള്ള ": "Chrome में वेबसाइट URL के बाईं ओर ऊपर ",
    " ഐക്കണിൽ ക്ലിക്ക് ചെയ്യുക.": " आइकन पर क्लिक करें।",
    " (അനുമതികൾ) -> ": " (अनुमतियाँ) -> ",
    " തിരഞ്ഞെടുക്കുക.": " चुनें।",
    " ആക്കി മാറ്റുക.": " में बदलें।",
    "കൂടാതെ ഫോൺ Settings -> Apps -> Chrome -> Notifications ON ആണെന്ന് ഉറപ്പുവരുത്തുക.": "साथ ही फोन Settings -> Apps -> Chrome -> Notifications को ON रखें।",
    "Safari-യിൽ ആദ്യം ": "Safari में पहले ",
    " വഴി ഈ ആപ്പ് ഫോൺ ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക.": " के ज़रिए इस ऐप को फोन की होम स्क्रीन पर जोड़ें।",
    "iPhone-ന്റെ പ്രധാന ": "iPhone की मुख्य ",
    " തുറന്ന് ": " खोलें और ",
    " അല്ലെങ്കിൽ ": " या ",
    " ഓൺ ചെയ്യുക.": " चालू करें।",
    "ബ്രൗസറിന്റെ അഡ്രസ്സ് ബാറിലുള്ള ": "ब्राउज़र के address bar में ",
    " എന്നതിന് നേരെയുള്ള സ്വിച്ച് ": " के सामने वाला switch ",
    "ബ്രൗസറിൽ മുകളിൽ വലത് വശത്തുള്ള ": "ब्राउज़र में ऊपर दाईं ओर ",
    "ക്ലിക്ക് ചെയ്യുക.": "क्लिक करें।",
    "വരുന്ന മെനുവിൽ നിന്ന് ": "दिखने वाले menu से ",
    "ക്ലിക്ക് ചെയ്യുക. ഫോണിന്റെ സ്ക്രീനിൽ ഈ ആപ്പിന്റെ ഐക്കൺ റെഡിയാകും!": "क्लिक करें। फोन की स्क्रीन पर ऐप का आइकन दिखाई देगा!",
    "താഴേക്ക് സ്ക്രോൾ ചെയ്ത് ": "नीचे scroll करके ",
    "മുകളിൽ വലതുവശത്തുള്ള ": "ऊपर दाईं ओर ",
    "കമ്പ്യൂട്ടറിൽ ഡെസ്ക്ടോപ്പ് ആപ്പായി ഇത് പ്രവർത്തിക്കും.": "यह कंप्यूटर पर desktop app की तरह काम करेगा।",
    "ആപ്പ് നിങ്ങളുടെ ഫോണിലേക്ക് ഇൻസ്റ്റാൾ ചെയ്ത് ഒറ്റ ക്ലിക്കിൽ ഉപയോഗിക്കാൻ താഴെ പറയുന്ന സ്റ്റെപ്പുകൾ ചെയ്യുക:": "ऐप को फोन में इंस्टॉल करके एक क्लिक में इस्तेमाल करने के लिए नीचे दिए गए चरण अपनाएँ:",
    "Below 500, top up needed immediately!": "500 से कम है, तुरंत स्टॉक भरें!",
    "warnings": "चेतावनियाँ",
    "warning": "चेतावनी",
    "Total stock is ": "कुल स्टॉक ",
    "below ": "से कम ",
    "top up needed": "स्टॉक भरें",
    " total is ": " कुल है ",
    "Guest amenities": "अतिथि सुविधाएँ",
    ": count needed": ": गिनती आवश्यक",
    ": stock is 0 (Out of stock!)": ": स्टॉक 0 है (स्टॉक खत्म!)",
    "Not Supported": "समर्थित नहीं",
    "Active": "सक्रिय",
    "Blocked in Settings": "सेटिंग्स में ब्लॉक है",
    "Not Enabled": "चालू नहीं",
    "Browser Alerts Active": "ब्राउज़र अलर्ट सक्रिय",
    "Enable in Settings Below": "नीचे सेटिंग्स में चालू करें",
    "Alerts: Active": "अलर्ट: सक्रिय",
    "Alerts: Blocked": "अलर्ट: ब्लॉक",
    "Alerts & Settings": "अलर्ट और सेटिंग्स",
    "Notifications not supported in this browser.": "इस ब्राउज़र में नोटिफिकेशन समर्थित नहीं हैं।",
    "⚠️ Blocked! Please follow the steps below to enable.": "⚠️ ब्लॉक है! चालू करने के लिए नीचे दिए गए चरण अपनाएँ।",
    "🔊 In-app warning sound enabled": "🔊 ऐप की चेतावनी ध्वनि चालू है",
    "🔇 In-app warning sound muted": "🔇 ऐप की चेतावनी ध्वनि बंद है",
    "• Stock alerts turned ON successfully!": "• स्टॉक अलर्ट सफलतापूर्वक चालू हो गए!",
    "• Stock alerts are now active!": "• स्टॉक अलर्ट अब सक्रिय हैं!",
    "⚠️ Alerts not allowed. Follow the steps below.": "⚠️ अलर्ट की अनुमति नहीं मिली। नीचे दिए गए चरण अपनाएँ।",
    "• Great! No items currently have 0 stock.": "• बहुत अच्छा! किसी भी आइटम का स्टॉक शून्य नहीं है।",
    "Read directly by ": "सीधे पढ़ा गया: ",
    " ((AI Vision)). Check every room, status, ETA and ROOMS count before deduction.": " ((AI Vision)). कटौती से पहले हर कमरे, स्थिति, ETA और ROOMS गिनती जाँचें।",
    " found ": " मिला: ",
    " room entries across ": " कमरे की एंट्री, कुल ",
    " rows. Review before confirming.": " पंक्तियों में। पुष्टि से पहले जाँचें।",
    " could not identify room rows. Please upload a clearer rooming sheet.": " कमरे की पंक्तियाँ पहचान नहीं सका। कृपया अधिक स्पष्ट रूमिंग शीट अपलोड करें।",
    "AI reading failed on all providers: ": "सभी AI सेवाओं पर पढ़ना विफल रहा: ",
    "AI review failed on all providers: ": "सभी AI सेवाओं पर समीक्षा विफल रही: ",
    "Not Supported": "समर्थित नहीं",
    "Active •": "सक्रिय •",
    "Blocked in Settings": "सेटिंग्स में ब्लॉक है",
    "Not Enabled": "चालू नहीं",
    "Browser Alerts Active •": "ब्राउज़र अलर्ट सक्रिय •",
    "Enable in Settings Below ⬇": "नीचे सेटिंग्स में चालू करें ⬇",
    "Alerts: Active •": "अलर्ट: सक्रिय •",
    "Alerts: Blocked ⚠️": "अलर्ट: ब्लॉक ⚠️",
    "Alerts & Settings": "अलर्ट और सेटिंग्स",
  };

  const itemHindi = {
    'Broom':'झाड़ू','Mop':'पोछा','Gloves':'दस्ताने','Room freshener':'रूम फ्रेशनर',
    'Toilet roll':'टॉयलेट रोल','Restaurant tissue':'रेस्टोरेंट टिश्यू',
    'Garbage cover small':'छोटा कचरा बैग','Garbage cover big':'बड़ा कचरा बैग',
    'Floor cleaner':'फ्लोर क्लीनर','Glass cleaner':'ग्लास क्लीनर',
    'Dental kit':'डेंटल किट','Shaving kit':'शेविंग किट','Shower cap':'शावर कैप',
    'Soap':'साबुन','Shampoo':'शैम्पू','Moisturiser':'मॉइस्चराइज़र'
  };

  const tr = key => currentLanguage === 'hi' ? (hindi[key] || key) : key;
  const localizedItemName = name => currentLanguage === 'hi' ? (itemHindi[name] || name) : name;
  const localizedCategory = name => tr(name);
  const localizedUnit = unit => currentLanguage === 'hi' ? ({pcs:'नग',boxes:'डिब्बे'}[unit] || unit) : unit;

  function translateMessage(value) {
    let text = String(value ?? '');
    if (currentLanguage !== 'hi') return text;
    for (const [english, translated] of Object.entries(hindi)) {
      if (english) text = text.split(english).join(translated);
    }
    for (const [english, translated] of Object.entries(itemHindi)) {
      text = text.split(english).join(translated);
    }
    return text
      .replaceAll('Required:', 'आवश्यक:')
      .replaceAll('Available:', 'उपलब्ध:')
      .replaceAll('Short:', 'कम:')
      .replaceAll('Insufficient stock', 'स्टॉक अपर्याप्त है')
      .replaceAll('No stock available', 'स्टॉक उपलब्ध नहीं है');
  }

  function translateDom(root = document) {
    if (currentLanguage !== 'hi') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!trimmed) return;
      const translated = translateMessage(trimmed);
      if (translated !== trimmed) node.nodeValue = original.replace(trimmed, translated);
    });
    root.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(el => {
      ['title','aria-label','placeholder'].forEach(attr => {
        const value = el.getAttribute(attr);
        if (value) el.setAttribute(attr, translateMessage(value));
      });
    });
  }

  const nativeAlert = window.alert.bind(window);
  const nativeConfirm = window.confirm.bind(window);
  window.alert = message => nativeAlert(translateMessage(message));
  window.confirm = message => nativeConfirm(translateMessage(message));

  if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener('change', () => {
      currentLanguage = languageSelect.value === 'hi' ? 'hi' : 'en';
      localStorage.setItem('hk_language', currentLanguage);
      location.reload();
    });
  }
  translateDom();
  new MutationObserver(records => {
    if (currentLanguage !== 'hi') return;
    records.forEach(record => {
      if (record.type === 'childList') record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const translated = translateMessage(node.nodeValue);
          if (translated !== node.nodeValue) node.nodeValue = translated;
        } else if (node.nodeType === Node.ELEMENT_NODE) translateDom(node);
      });
      else if (record.type === 'characterData') {
        const translated = translateMessage(record.target.nodeValue);
        if (translated !== record.target.nodeValue) record.target.nodeValue = translated;
      }
    });
  }).observe(document.body, {subtree:true, childList:true, characterData:true});


  let state = {
    minTotalStock: 500,
    minGuestAmenitiesStock: 500,
    items: [],
    deferredPrompt: null
  };

  const defaultItems = [
    { id: "broom", name: "Broom", category: "Cleaning supplies", unit: "pcs", currentCount: null, minStock: 20, lastCountedAt: null },
    { id: "mop", name: "Mop", category: "Cleaning supplies", unit: "pcs", currentCount: null, minStock: 20, lastCountedAt: null },
    { id: "gloves", name: "Gloves", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 50, lastCountedAt: null },
    { id: "room_freshener", name: "Room freshener", category: "Cleaning supplies", unit: "pcs", currentCount: null, minStock: 25, lastCountedAt: null },
    { id: "toilet_roll", name: "Toilet roll", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 100, lastCountedAt: null },
    { id: "restaurant_tissue", name: "Restaurant tissue", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 80, lastCountedAt: null },
    { id: "garbage_cover_small", name: "Garbage cover small", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 2, maxLimit: 5, lastCountedAt: null },
    { id: "garbage_cover_big", name: "Garbage cover big", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 2, maxLimit: 5, lastCountedAt: null },
    { id: "floor_cleaner", name: "Floor cleaner", category: "Chemical supplies", unit: "pcs", currentCount: null, minStock: 3, maxLimit: 5, lastCountedAt: null },
    { id: "glass_cleaner", name: "Glass cleaner", category: "Chemical supplies", unit: "pcs", currentCount: null, minStock: 3, maxLimit: 5, lastCountedAt: null },
    { id: "dental_kit", name: "Dental kit", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 60, lastCountedAt: null },
    { id: "shaving_kit", name: "Shaving kit", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 50, lastCountedAt: null },
    { id: "shower_cap", name: "Shower cap", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 50, lastCountedAt: null },
    { id: "soap", name: "Soap", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 80, lastCountedAt: null },
    { id: "shampoo", name: "Shampoo", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 80, lastCountedAt: null },
    { id: "moisturiser", name: "Moisturiser", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 50, lastCountedAt: null }
  ];

  // DOM Elements
  const statItemsTracked = document.getElementById('statItemsTracked');
  const statToCountNow = document.getElementById('statToCountNow');
  const statTotalStock = document.getElementById('statTotalStock');
  const swipeSummaryTrack = document.getElementById('swipeSummaryTrack');
  const warningBox = document.getElementById('warningBox');
  const warningTitle = document.getElementById('warningTitle');
  const warningList = document.getElementById('warningList');
  const categoriesContainer = document.getElementById('categoriesContainer');
  const amenitiesAlertBanner = document.getElementById('amenitiesAlertBanner');
  const amenitiesCurrentTotal = document.getElementById('amenitiesCurrentTotal');
  const enableNotifyBtn = document.getElementById('enableNotifyBtn');
  const notifyBtnText = document.getElementById('notifyBtnText');
  const installPwaBtn = document.getElementById('installPwaBtn');
  
  // Zero Stock Modal Elements
  const zeroStockReportBtn = document.getElementById('zeroStockReportBtn');
  const zeroStockModal = document.getElementById('zeroStockModal');
  const closeZeroStockModal = document.getElementById('closeZeroStockModal');
  const backFromZeroModalBtn = document.getElementById('backFromZeroModalBtn');
  const backBottomZeroBtn = document.getElementById('backBottomZeroBtn');
  const zeroStockContent = document.getElementById('zeroStockContent');
  const downloadZeroCsvBtn = document.getElementById('downloadZeroCsvBtn');
  const shareZeroReportBtn = document.getElementById('shareZeroReportBtn');

  // Alerts & Settings Modal Elements
  const alertsSettingsModal = document.getElementById('alertsSettingsModal');
  const closeAlertsSettingsModal = document.getElementById('closeAlertsSettingsModal');
  const closeSettingsBottomBtn = document.getElementById('closeSettingsBottomBtn');
  const notifStatusBadge = document.getElementById('notifStatusBadge');
  const settingsRequestPermissionBtn = document.getElementById('settingsRequestPermissionBtn');
  const testAlertBtn = document.getElementById('testAlertBtn');
  const soundAlertToggle = document.getElementById('soundAlertToggle');

  // Settings Device Tabs
  const tabAndroidBtn = document.getElementById('tabAndroidBtn');
  const tabIosBtn = document.getElementById('tabIosBtn');
  const tabPcBtn = document.getElementById('tabPcBtn');
  const androidGuideView = document.getElementById('androidGuideView');
  const iosGuideView = document.getElementById('iosGuideView');
  const pcGuideView = document.getElementById('pcGuideView');

  // Add to Phone Modal Elements
  const addToPhoneModal = document.getElementById('addToPhoneModal');
  const closeAddToPhoneModal = document.getElementById('closeAddToPhoneModal');
  const closeInstallBottomBtn = document.getElementById('closeInstallBottomBtn');
  const nativeInstallPromptSection = document.getElementById('nativeInstallPromptSection');
  const directInstallBtn = document.getElementById('directInstallBtn');

  const tabInstallAndroid = document.getElementById('tabInstallAndroid');
  const tabInstallIos = document.getElementById('tabInstallIos');
  const tabInstallPc = document.getElementById('tabInstallPc');
  const installAndroidView = document.getElementById('installAndroidView');
  const installIosView = document.getElementById('installIosView');
  const installPcView = document.getElementById('installPcView');

  // Toast Box
  const appToast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  let isFirstRender = true;

  function init() {
    registerServiceWorker();
    setupNotificationHandlers();
    setupPwaInstall();
    setupZeroStockReport();
    loadData();

    if (location.protocol.startsWith('http')) {
      setInterval(loadFromServer, 2500);
    }
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }

  function base64UrlToUint8Array(value) { const pad = '='.repeat((4 - value.length % 4) % 4); const raw = atob((value + pad).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, c => c.charCodeAt(0)); }
  async function enableWebPush() {
    if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) throw new Error('Web Push is not supported in this browser.');
    const permission = await Notification.requestPermission(); if (permission !== 'granted') throw new Error('Notification permission was not granted.');
    const registration = await navigator.serviceWorker.ready;
    const keyResponse = await fetch('/api/push/vapid-public-key', { cache: 'no-store' }); const keyData = await keyResponse.json(); if (!keyResponse.ok) throw new Error(keyData.error || 'Could not load VAPID key.');
    let subscription = await registration.pushManager.getSubscription(); if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(keyData.publicKey) });
    const saved = await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: subscription.toJSON() }) }); const savedData = await saved.json(); if (!saved.ok) throw new Error(savedData.error || 'Could not save subscription.');
    localStorage.setItem('hk_push_enabled', 'true'); localStorage.removeItem('hk_push_banner_dismissed'); const banner = document.getElementById('webPushBanner'); if (banner) banner.hidden = true; updateNotificationStatusUI(); return true;
  }
  function setupWebPushBanner() {
    const banner = document.getElementById('webPushBanner'); const turnOn = document.getElementById('webPushTurnOn'); const later = document.getElementById('webPushLater'); if (!banner || !turnOn || !later) return;
    const supported = 'Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator; if (supported && Notification.permission === 'default' && localStorage.getItem('hk_push_banner_dismissed') !== 'true') banner.hidden = false;
    later.addEventListener('click', () => { localStorage.setItem('hk_push_banner_dismissed', 'true'); banner.hidden = true; });
    turnOn.addEventListener('click', async () => { turnOn.disabled = true; try { await enableWebPush(); showToast('Push notifications enabled.', '🔔'); } catch (e) { showToast(e.message || 'Could not enable notifications.', '⚠️'); } finally { turnOn.disabled = false; turnOn.textContent = 'Turn On'; } });
  }
  // Web Audio Synthesizer Chime
  function playAlertChime() {
    if (localStorage.getItem('hk_sound_enabled') === 'false') return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not allowed or blocked", e);
    }
  }

  // Floating Toast
  function showToast(msg, icon = '🔔') {
    if (!appToast) return;
    toastMsg.textContent = msg;
    toastIcon.textContent = icon;
    appToast.classList.add('show');
    setTimeout(() => {
      appToast.classList.remove('show');
    }, 3500);
  }

  // Device Auto-Detection
  function detectDeviceAndSelectTab() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isIos) {
      switchInstallTab('ios');
      switchSettingsTab('ios');
    } else if (isAndroid) {
      switchInstallTab('android');
      switchSettingsTab('android');
    } else {
      switchInstallTab('pc');
      switchSettingsTab('pc');
    }
  }

  function openAlertsSettingsModal() {
    updateNotificationStatusUI();
    detectDeviceAndSelectTab();
    alertsSettingsModal.classList.add('open');
  }

  function openAddToPhoneModal() {
    detectDeviceAndSelectTab();
    if (state.deferredPrompt && nativeInstallPromptSection) {
      nativeInstallPromptSection.style.display = 'block';
    } else if (nativeInstallPromptSection) {
      nativeInstallPromptSection.style.display = 'none';
    }
    addToPhoneModal.classList.add('open');
  }

  function switchSettingsTab(tab) {
    if (!tabAndroidBtn) return;
    tabAndroidBtn.classList.toggle('active', tab === 'android');
    tabIosBtn.classList.toggle('active', tab === 'ios');
    tabPcBtn.classList.toggle('active', tab === 'pc');
    androidGuideView.style.display = tab === 'android' ? 'block' : 'none';
    iosGuideView.style.display = tab === 'ios' ? 'block' : 'none';
    pcGuideView.style.display = tab === 'pc' ? 'block' : 'none';
  }

  function switchInstallTab(tab) {
    if (!tabInstallAndroid) return;
    tabInstallAndroid.classList.toggle('active', tab === 'android');
    tabInstallIos.classList.toggle('active', tab === 'ios');
    tabInstallPc.classList.toggle('active', tab === 'pc');
    installAndroidView.style.display = tab === 'android' ? 'block' : 'none';
    installIosView.style.display = tab === 'ios' ? 'block' : 'none';
    installPcView.style.display = tab === 'pc' ? 'block' : 'none';
  }

  function updateNotificationStatusUI() {
    if (!notifStatusBadge) return;
    if (!('Notification' in window)) {
      notifStatusBadge.textContent = '● Not Supported';
      notifStatusBadge.className = 'status-pill status-denied';
      if (settingsRequestPermissionBtn) settingsRequestPermissionBtn.style.display = 'none';
      return;
    }
    const perm = Notification.permission;
    if (perm === 'granted') {
      notifStatusBadge.textContent = '● Active •';
      notifStatusBadge.className = 'status-pill status-granted';
      if (settingsRequestPermissionBtn) {
        settingsRequestPermissionBtn.textContent = 'Browser Alerts Active •';
        settingsRequestPermissionBtn.style.background = '#10b981';
      }
      enableNotifyBtn.classList.add('active');
      notifyBtnText.textContent = '🔔 Alerts: Active •';
    } else if (perm === 'denied') {
      notifStatusBadge.textContent = '● Blocked in Settings';
      notifStatusBadge.className = 'status-pill status-denied';
      if (settingsRequestPermissionBtn) {
        settingsRequestPermissionBtn.textContent = 'Enable in Settings Below ⬇';
        settingsRequestPermissionBtn.style.background = '#dc2626';
      }
      enableNotifyBtn.classList.remove('active');
      notifyBtnText.textContent = '🔔 Alerts: Blocked ⚠️';
    } else {
      notifStatusBadge.textContent = '● Not Enabled';
      notifStatusBadge.className = 'status-pill status-default';
      if (settingsRequestPermissionBtn) {
        settingsRequestPermissionBtn.textContent = 'Turn On Browser Alerts';
        settingsRequestPermissionBtn.style.background = 'var(--btn-save-bg)';
        settingsRequestPermissionBtn.style.color = 'var(--btn-save-text)';
      }
      enableNotifyBtn.classList.remove('active');
      notifyBtnText.textContent = '🔔 Alerts & Settings';
    }
  }

  function setupPwaInstall() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      installPwaBtn.style.display = 'none';
      return;
    }

    // Show the in-app install action only when Chrome says installation is available.
    installPwaBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredPrompt = event;
      installPwaBtn.style.display = 'inline-flex';
      if (nativeInstallPromptSection) nativeInstallPromptSection.style.display = 'block';
    });

    window.addEventListener('appinstalled', () => {
      state.deferredPrompt = null;
      installPwaBtn.style.display = 'none';
      if (nativeInstallPromptSection) nativeInstallPromptSection.style.display = 'none';
      addToPhoneModal.classList.remove('open');
    });

    installPwaBtn.addEventListener('click', openAddToPhoneModal);
    closeAddToPhoneModal.addEventListener('click', () => addToPhoneModal.classList.remove('open'));
    closeInstallBottomBtn.addEventListener('click', () => addToPhoneModal.classList.remove('open'));

    if (directInstallBtn) {
      directInstallBtn.addEventListener('click', async () => {
        const promptEvent = state.deferredPrompt;
        if (!promptEvent) return;
        state.deferredPrompt = null;
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          installPwaBtn.style.display = 'none';
          if (nativeInstallPromptSection) nativeInstallPromptSection.style.display = 'none';
        }
      });
    }

    tabInstallAndroid.addEventListener('click', () => switchInstallTab('android'));
    tabInstallIos.addEventListener('click', () => switchInstallTab('ios'));
    tabInstallPc.addEventListener('click', () => switchInstallTab('pc'));
  }

  function setupNotificationHandlers() {
    updateNotificationStatusUI();

    enableNotifyBtn.addEventListener('click', openAlertsSettingsModal);
    closeAlertsSettingsModal.addEventListener('click', () => alertsSettingsModal.classList.remove('open'));
    closeSettingsBottomBtn.addEventListener('click', () => alertsSettingsModal.classList.remove('open'));

    // Sound toggle
    const soundPref = localStorage.getItem('hk_sound_enabled');
    if (soundPref !== null) {
      soundAlertToggle.checked = soundPref !== 'false';
    }
    soundAlertToggle.addEventListener('change', (e) => {
      localStorage.setItem('hk_sound_enabled', e.target.checked);
      showToast(translateMessage(e.target.checked ? '🔊 In-app warning sound enabled' : '🔇 In-app warning sound muted'), '🔊');
      if (e.target.checked) playAlertChime();
    });

    // Request Notification Permission
    settingsRequestPermissionBtn.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast(translateMessage('Notifications not supported in this browser.'), '⚠️');
        return;
      }
      if (Notification.permission === 'denied') {
        showToast(translateMessage('⚠️ Blocked! Please follow the steps below to enable.'), '⚠️');
        detectDeviceAndSelectTab();
        return;
      }
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') await enableWebPush();
        updateNotificationStatusUI();
        if (perm === 'granted') {
          playAlertChime();
          showToast(translateMessage('• Stock alerts turned ON successfully!'), '');
          new Notification(translateMessage('Housekeeping Stock Count'), {
            body: translateMessage('• Stock alerts are now active!'),
            icon: 'icon.png'
          });
        } else {
          showToast(translateMessage('⚠️ Alerts not allowed. Follow the steps below.'), '⚠️');
          detectDeviceAndSelectTab();
        }
      } catch (e) {
        console.log(e);
      }
    });

    // Test Alert Button
    testAlertBtn.addEventListener('click', async () => {
      playAlertChime();
      const guestItems = state.items.filter(i => i.category === 'Guest amenities');
      const guestTotal = guestItems.reduce((sum, i) => sum + (i.currentCount || 0), 0);
      const zeroCount = state.items.filter(i => i.currentCount === 0 || i.currentCount === null).length;
      showToast(`🔔 Test Alert! Amenities: ${guestTotal} pcs | Need count: ${zeroCount}`, '🔔');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Housekeeping Stock Alert', {
          body: `Stock Alert Working! Amenities: ${guestTotal} pcs | Items to count: ${zeroCount}`,
          icon: '/icons/icon-192.png'
        });
      }
      if (localStorage.getItem('hk_push_enabled') === 'true') {
        const token = window.prompt('Enter the PUSH_TEST_TOKEN configured by the administrator:');
        if (!token) return;
        try {
          const response = await fetch('/api/push/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-push-test-token': token },
            body: JSON.stringify({ title: 'Housekeeping Stock Test', body: 'Web Push notifications are working.', url: '/' })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Push test failed.');
          showToast(`Push test sent: ${result.sent}/${result.total}`, '🔔');
        } catch (error) {
          showToast(error.message || 'Push test failed.', '⚠️');
        }
      }
    });

    // Tab switching for settings guide
    tabAndroidBtn.addEventListener('click', () => switchSettingsTab('android'));
    tabIosBtn.addEventListener('click', () => switchSettingsTab('ios'));
    tabPcBtn.addEventListener('click', () => switchSettingsTab('pc'));
  }

  function checkAndSendStockNotifications() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const guestItems = state.items.filter(i => i.category === 'Guest amenities');
    const guestTotal = guestItems.reduce((sum, i) => sum + (i.currentCount || 0), 0);

    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    const lastNotifKey = 'hk_last_notif_time';
    const lastNotifTime = parseInt(localStorage.getItem(lastNotifKey) || '0', 10);
    const shouldSend = (now - lastNotifTime) > (4 * 60 * 60 * 1000);

    if (guestTotal < state.minGuestAmenitiesStock && shouldSend) {
      new Notification('⚠️ Guest Amenities Warning (<500)', {
        body: `Total guest amenities stock is ${guestTotal} pcs (Below 500 threshold)!`,
        icon: 'icon.png'
      });
      localStorage.setItem(lastNotifKey, now.toString());
    }

    const lowOrDueItems = state.items.filter(item => {
      const isZeroOrLow = item.currentCount !== null && (item.currentCount === 0 || (item.minStock && item.currentCount < item.minStock));
      const notCountedFor2Days = !item.lastCountedAt || (now - new Date(item.lastCountedAt).getTime() > twoDaysMs);
      return isZeroOrLow || (item.currentCount === null && notCountedFor2Days);
    });

    if (lowOrDueItems.length > 0 && shouldSend) {
      const itemNames = lowOrDueItems.slice(0, 3).map(i => i.name).join(', ');
      new Notification('⚠️ 2-Day Stock Alert', {
        body: `Zero/low stock or count required: ${itemNames}`,
        icon: 'icon.png'
      });
      localStorage.setItem(lastNotifKey, now.toString());
    }
  }

  // Zero Stock Report Setup (with Back, Share, and Download)
  function setupZeroStockReport() {
    zeroStockReportBtn.addEventListener('click', openZeroStockReport);

    const closeReport = () => zeroStockModal.classList.remove('open');
    closeZeroStockModal.addEventListener('click', closeReport);
    backFromZeroModalBtn.addEventListener('click', closeReport);
    backBottomZeroBtn.addEventListener('click', closeReport);

    // Download CSV
    downloadZeroCsvBtn.addEventListener('click', () => {
      const zeroItems = state.items.filter(i => i.currentCount === 0 || i.currentCount === null);
      let csv = "Item,Category,Count,Unit,Status\n";
      zeroItems.forEach(i => {
        const count = i.currentCount !== null ? i.currentCount : 0;
        const status = i.currentCount === 0 ? "Out of Stock (0)" : "Not Counted";
        csv += `"${i.name}","${i.category}",${count},"${i.unit}","${status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `zero_stock_report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    });

    // Share Report (WhatsApp / Email / Clipboard)
    shareZeroReportBtn.addEventListener('click', async () => {
      const zeroItems = state.items.filter(i => i.currentCount === 0 || i.currentCount === null);
      let shareText = `*Housekeeping Zero Stock Report*\nDate: ${new Date().toLocaleDateString()}\n\n`;
      if (zeroItems.length === 0) {
        shareText += "All items are in stock! No zero stock items.";
      } else {
        zeroItems.forEach((i, idx) => {
          const status = i.currentCount === 0 ? "0 " + i.unit : "Not counted yet";
          shareText += `${idx + 1}. ${i.name} (${i.category}): ${status}\n`;
        });
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Housekeeping Zero Stock Report',
            text: shareText
          });
        } catch (e) {}
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('• Report summary copied to clipboard! You can paste and send it on WhatsApp or Email.');
        }).catch(() => {
          prompt('Copy this report text:', shareText);
        });
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === zeroStockModal) zeroStockModal.classList.remove('open');
      if (e.target === alertsSettingsModal) alertsSettingsModal.classList.remove('open');
      if (e.target === addToPhoneModal) addToPhoneModal.classList.remove('open');
    });
  }

  function openZeroStockReport() {
    const zeroItems = state.items.filter(i => i.currentCount === 0 || i.currentCount === null);

    let rowsHtml = '';
    if (zeroItems.length === 0) {
      rowsHtml = `<tr><td colspan="4" style="text-align:center; padding: 24px; color: #34d399;">• Great! No items currently have 0 stock.</td></tr>`;
    } else {
      rowsHtml = zeroItems.map(item => {
        const countText = item.currentCount === 0 ? `0 ${item.unit}` : `Not counted yet`;
        const statusBadge = item.currentCount === 0 
          ? `<span class="zero-badge">Out of Stock (0)</span>` 
          : `<span class="zero-badge" style="background:#281b20; color:#fb7185;">Count needed</span>`;
        return `
          <tr>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>${escapeHtml(item.category)}</td>
            <td>${countText}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    const html = `
      <div style="margin-bottom:14px; font-size:13px; color:var(--text-muted);">
        <strong>Report Date:</strong> ${new Date().toLocaleString()}<br/>
        <strong>Items with 0 or uncounted stock:</strong> <span style="color:#f87171; font-weight:700;">${zeroItems.length} items</span>
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Current Count</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    zeroStockContent.innerHTML = html;
    zeroStockModal.classList.add('open');
  }

  async function loadData() {
    if (location.protocol.startsWith('http')) {
      await loadFromServer();
    } else {
      const local = localStorage.getItem('hk_stock_items');
      state.items = local ? JSON.parse(local) : defaultItems;
      renderFull();
      checkAndSendStockNotifications();
    }
  }

  async function loadFromServer() {
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        state.items = data.items || defaultItems;
        if (isFirstRender) {
          renderFull();
          isFirstRender = false;
        } else {
          updateExistingDOM();
        }
        checkAndSendStockNotifications();
        return;
      }
    } catch (e) {}

    const local = localStorage.getItem('hk_stock_items');
    state.items = local ? JSON.parse(local) : defaultItems;
    if (isFirstRender) {
      renderFull();
      isFirstRender = false;
    } else {
      updateExistingDOM();
    }
  }

  function renderFull() {
    renderStatsAndWarnings();
    renderSwipeColumns();

    // 3 distinct categories in requested order
    const categories = ['Cleaning supplies', 'Chemical supplies', 'Guest amenities'];
    let html = '';

    categories.forEach(cat => {
      const catItems = state.items.filter(i => i.category === cat);
      if (catItems.length === 0) return;

      html += `
        <section class="category-section">
          <h2 class="category-title">${escapeHtml(localizedCategory(cat))}</h2>
          <div class="items-list">
            ${catItems.map(item => `
              <div class="item-card" id="card-${item.id}">
                <div class="item-top">
                  <span class="item-name">${escapeHtml(localizedItemName(item.name))}</span>
                  <span class="item-count-display ${item.currentCount !== null ? 'has-count' : ''}" id="display-${item.id}">
                    ${item.currentCount !== null ? `${item.currentCount} ${localizedUnit(item.unit)}` : `— ${localizedUnit(item.unit)}`}
                  </span>
                </div>
                <div class="item-status-row" id="status-${item.id}">
                  ${item.currentCount === null 
                    ? `<span class="status-badge badge-needed">Count needed</span><span class="status-subtext">Not counted yet</span>`
                    : `<span class="status-badge badge-done">Counted</span><span class="status-subtext">Counted</span>`
                  }
                </div>
                <div class="item-actions">
                  <div class="input-stepper-wrap">
                    <button type="button" class="step-btn minus-btn" data-id="${item.id}">−</button>
                    <input 
                      type="number" 
                      min="0" 
                      max="${item.maxLimit || (item.category === 'Chemical supplies' ? 5 : 999)}"
                      inputmode="numeric" 
                      pattern="[0-9]*" 
                      class="count-input" 
                      placeholder="0" 
                      id="input-${item.id}"
                      data-id="${item.id}" 
                      value="${item.currentCount !== null ? item.currentCount : ''}" 
                    />
                    <button type="button" class="step-btn plus-btn" data-id="${item.id}">+</button>
                  </div>
                  <button type="button" class="btn-save" id="save-btn-${item.id}" data-id="${item.id}">Save count</button>
                  <button type="button" class="btn-reset" data-id="${item.id}">Reset</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    });

    categoriesContainer.innerHTML = html;
    bindInputHandlers();
  }

  function updateExistingDOM() {
    renderStatsAndWarnings();
    renderSwipeColumns();

    state.items.forEach(item => {
      const disp = document.getElementById(`display-${item.id}`);
      if (disp) {
        disp.textContent = item.currentCount !== null ? `${item.currentCount} ${item.unit}` : `— ${item.unit}`;
        if (item.currentCount !== null) {
          disp.classList.add('has-count');
        } else {
          disp.classList.remove('has-count');
        }
      }

      const statusEl = document.getElementById(`status-${item.id}`);
      if (statusEl) {
        if (item.currentCount === null) {
          statusEl.innerHTML = `<span class="status-badge badge-needed">Count needed</span><span class="status-subtext">Not counted yet</span>`;
        } else {
          statusEl.innerHTML = `<span class="status-badge badge-done">Counted</span><span class="status-subtext">Counted</span>`;
        }
      }

      const input = document.getElementById(`input-${item.id}`);
      if (input && document.activeElement !== input) {
        if (item.currentCount !== null) {
          input.value = item.currentCount;
        } else if (input.value !== '' && !input.dataset.userEdited) {
          input.value = '';
        }
      }
    });
  }

  function renderStatsAndWarnings() {
    const totalItems = state.items.length;
    const toCount = state.items.filter(i => i.currentCount === null).length;
    const total = state.items.reduce((sum, i) => sum + (i.currentCount || 0), 0);
    
    statItemsTracked.textContent = totalItems;
    statToCountNow.textContent = toCount;
    statTotalStock.textContent = total;

    const guestItems = state.items.filter(i => i.category === 'Guest amenities');
    const guestTotal = guestItems.reduce((sum, i) => sum + (i.currentCount || 0), 0);

    if (guestTotal < state.minGuestAmenitiesStock) {
      amenitiesAlertBanner.style.display = 'flex';
      amenitiesCurrentTotal.textContent = `${guestTotal} pcs`;
    } else {
      amenitiesAlertBanner.style.display = 'none';
    }

    const warnings = [];
    if (total < state.minTotalStock) {
      warnings.push(`Total stock is <strong>${total}</strong>: below ${state.minTotalStock}, top up needed`);
    }
    if (guestTotal < state.minGuestAmenitiesStock) {
      warnings.push(`<strong>Guest amenities</strong> total is ${guestTotal}: below ${state.minGuestAmenitiesStock}, top up needed`);
    }

    state.items.forEach(i => {
      if (i.currentCount === null) {
        warnings.push(`<strong>${i.name}</strong>: count needed`);
      } else if (i.currentCount === 0) {
        warnings.push(`<strong>${i.name}</strong>: stock is 0 (Out of stock!)`);
      }
    });

    if (warnings.length === 0) {
      warningTitle.textContent = "0 warnings";
      warningList.innerHTML = `<li class="warning-empty">All supplies counted! Stock levels are sufficient.</li>`;
    } else {
      warningTitle.textContent = `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`;
      warningList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
    }
  }

  function renderSwipeColumns() {
    if (!swipeSummaryTrack) return;
    let trackHtml = '';
    state.items.forEach(item => {
      const isCounted = item.currentCount !== null;
      const countText = isCounted ? `${item.currentCount} ${item.unit}` : `—`;
      trackHtml += `
        <div class="mini-stock-col ${isCounted ? 'has-count' : 'needs-count'}" data-scroll-to="card-${item.id}" title="Click to view ${escapeHtml(item.name)}">
          <span class="mini-stock-name">${escapeHtml(item.name)}</span>
          <span class="mini-stock-count">${countText}</span>
        </div>
      `;
    });
    swipeSummaryTrack.innerHTML = trackHtml;

    document.querySelectorAll('.mini-stock-col').forEach(col => {
      col.onclick = () => {
        const targetId = col.dataset.scrollTo;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.style.outline = '2px solid #38bdf8';
          setTimeout(() => { targetEl.style.outline = 'none'; }, 1500);
        }
      };
    });
  }

  function bindInputHandlers() {
    document.querySelectorAll('.count-input').forEach(input => {
      input.addEventListener('input', () => {
        input.dataset.userEdited = 'true';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const id = input.dataset.id;
          saveCount(id, input.value);
        }
      });
    });

    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = state.items.find(i => i.id === id);
        const input = document.getElementById(`input-${id}`);
        let current = parseInt(input.value, 10);
        if (isNaN(current)) current = 0;

        // Check 5 limit for Chemical supplies or items with maxLimit
        const maxLimit = item ? (item.maxLimit || (item.category === 'Chemical supplies' ? 5 : null)) : null;
        if (maxLimit && current >= maxLimit) {
      alert(currentLanguage === 'hi' ? `ERROR: ${item.name} count cannot exceed ${maxLimit}!` : `ERROR: ${item.name} count cannot exceed ${maxLimit}!`);
          return;
        }

        if (current >= 999) {
      alert(currentLanguage === 'hi' ? 'Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).' : 'Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).');
          return;
        }
        input.value = current + 1;
        input.dataset.userEdited = 'true';
      });
    });

    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const input = document.getElementById(`input-${id}`);
        let current = parseInt(input.value, 10);
        if (isNaN(current) || current <= 0) current = 0;
        else current = current - 1;
        input.value = current;
        input.dataset.userEdited = 'true';
      });
    });

    document.querySelectorAll('.btn-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const input = document.getElementById(`input-${id}`);
        saveCount(id, input.value);
      });
    });

    document.querySelectorAll('.btn-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        resetCount(id);
      });
    });


  }

  async function saveCount(id, val) {
    if (val === '' || isNaN(val) || Number(val) < 0) {
      alert('Please enter a valid count number (0 or higher).');
      return;
    }
    const num = parseInt(val, 10);
    const item = state.items.find(i => i.id === id);

    // Validation 1: Chemical supplies or maxLimit count > 5
    const maxAllowed = item ? (item.maxLimit || (item.category === 'Chemical supplies' ? 5 : null)) : null;
    if (maxAllowed && num > maxAllowed) {
      alert(currentLanguage === 'hi' ? `ERROR: ${item.name} count cannot exceed ${maxAllowed}!` : `ERROR: ${item.name} count cannot exceed ${maxAllowed}!`);
      return;
    }

    // Validation 2: Count >= 1000
    if (num >= 1000) {
      alert(currentLanguage === 'hi' ? 'Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).' : 'Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).');
      return;
    }

    const saveBtn = document.getElementById(`save-btn-${id}`);
    if (saveBtn) {
      saveBtn.textContent = '• Saved!';
      saveBtn.classList.add('saved');
      setTimeout(() => {
        saveBtn.textContent = 'Save count';
        saveBtn.classList.remove('saved');
      }, 1400);
    }

    const input = document.getElementById(`input-${id}`);
    if (input) delete input.dataset.userEdited;

    if (location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, count: num })
        });
        if (res.ok) {
          return loadFromServer();
        } else {
          const errData = await res.json();
          alert(errData.error || 'Server error');
          return;
        }
      } catch(e) {}
    }

    if (item) {
      item.currentCount = num;
      item.lastCountedAt = new Date().toISOString();
      localStorage.setItem('hk_stock_items', JSON.stringify(state.items));
      updateExistingDOM();
      checkAndSendStockNotifications();
    }
  }

  async function resetCount(id) {
    const item = state.items.find(i => i.id === id);
    const itemName = item ? item.name : 'this item';

    const confirmed = confirm(currentLanguage === 'hi' ? `Are you sure you want to reset the count for "${itemName}"?` : `Are you sure you want to reset the count for "${itemName}"?`);
    if (!confirmed) return;

    const input = document.getElementById(`input-${id}`);
    if (input) {
      input.value = '';
      delete input.dataset.userEdited;
    }

    if (location.protocol.startsWith('http')) {
      try {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        return loadFromServer();
      } catch(e) {}
    }

    if (item) {
      item.currentCount = null;
      item.lastCountedAt = null;
      localStorage.setItem('hk_stock_items', JSON.stringify(state.items));
      updateExistingDOM();
      checkAndSendStockNotifications();
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }


  // AI Rooming Sheet Reader and reviewed stock deduction
  const roomImageInput = document.getElementById('roomSheetImage');
  const roomPreview = document.getElementById('roomSheetPreview');
  const roomOcrStatus = document.getElementById('roomOcrStatus');
  const roomReview = document.getElementById('roomOcrReview');
  const roomOcrBtn = document.getElementById('runRoomOcrBtn');
  const confirmRoomBtn = document.getElementById('confirmRoomDeductionBtn');
  let ocrRows = [];
  let roomAiNote = '';
  const roomGalleryInput = document.getElementById('roomSheetGalleryImage');
  const roomCameraBtn = document.getElementById('roomOcrCameraBtn');
  const roomUploadBtn = document.getElementById('roomOcrUploadBtn');
  if (roomCameraBtn && roomImageInput) roomCameraBtn.addEventListener('click', () => roomImageInput.click());
  if (roomUploadBtn && roomGalleryInput) roomUploadBtn.addEventListener('click', () => roomGalleryInput.click());

  const validRoomNumbers = new Set([
    '101','102','103','104','105','106','107','108','109','110','111','112',
    '114','115','116','117','118','119','120','121','122','123','124','125',
    '126','127','128','129','131','132','133','134','135','136',
    'A1','A2','D1','D2','TREEHOUSE','CLUBVILLA'
  ]);
  const roomTokenPattern = '(?:101|102|103|104|105|106|107|108|109|110|111|112|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|131|132|133|134|135|136|A1|A2|D1|D2|TREE\\s*HOUSE|TREEHOUSE|CLUB\\s*VILLA|CLUBVILLA)';
  const roomGroupPattern = new RegExp('\\b' + roomTokenPattern + '(?:\\s*[-–/]\\s*' + roomTokenPattern + ')*', 'gi');

  function expandRoomGroup(raw) {
    if (!raw || typeof raw !== 'string') return [];
    const normalized = raw.toUpperCase()
      .replace(/TREE\s*HOUSE/g, 'TREEHOUSE')
      .replace(/CLUB\s*VILLA/g, 'CLUBVILLA')
      .replace(/[–—]/g, '-')
      .replace(/\s+TO\s+/gi, '-');

    const expanded = [];
    const parts = normalized.split(/[/,;\n&+]+/);
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;

      const range = trimmed.match(/^([A-Z]?\d+)\s*-\s*([A-Z]?\d+)$/);
      if (range && /^\d+$/.test(range[1]) && /^\d+$/.test(range[2])) {
        const from = Number(range[1]);
        const to = Number(range[2]);
        const step = from <= to ? 1 : -1;
        for (let n = from; n !== to + step; n += step) {
          const room = String(n);
          if (validRoomNumbers.has(room)) expanded.push(room);
        }
        return;
      } else if (range && range[1].startsWith('A') && range[2].startsWith('A')) {
        expanded.push('A1', 'A2');
        return;
      } else if (range && range[1].startsWith('D') && range[2].startsWith('D')) {
        expanded.push('D1', 'D2');
        return;
      }

      // Handle space-separated room numbers like "101 102 103"
      const tokens = trimmed.split(/\s+/);
      tokens.forEach(tok => {
        const val = tok.trim();
        if (!val) return;
        const subRange = val.match(/^([A-Z]?\d+)-([A-Z]?\d+)$/);
        if (subRange && /^\d+$/.test(subRange[1]) && /^\d+$/.test(subRange[2])) {
          const from = Number(subRange[1]);
          const to = Number(subRange[2]);
          const step = from <= to ? 1 : -1;
          for (let n = from; n !== to + step; n += step) {
            const room = String(n);
            if (validRoomNumbers.has(room)) expanded.push(room);
          }
        } else if (validRoomNumbers.has(val)) {
          expanded.push(val);
        }
      });
    });

    return [...new Set(expanded)].map(room =>
      room === 'TREEHOUSE' ? 'Treehouse' : room === 'CLUBVILLA' ? 'Clubvilla' : room
    );
  }

  function handleRoomImageChange(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    roomPreview.src = URL.createObjectURL(file);
    roomPreview.style.display = 'block';
    roomReview.innerHTML = '';
    confirmRoomBtn.disabled = true;
    ocrRows = [];
    roomOcrStatus.textContent = currentLanguage === 'hi' ? 'Image ready. Tap Read Image (AI).' : 'Image ready. Tap Read Image (AI).';
    roomImageInput.selectedRoomFile = file;
  }
  if (roomImageInput) roomImageInput.addEventListener('change', () => handleRoomImageChange(roomImageInput));
  if (roomGalleryInput) roomGalleryInput.addEventListener('change', () => handleRoomImageChange(roomGalleryInput));

  let showAllOcrRows = false;

  function isRowError(r) {
    const countDiff = Number.isInteger(r.expectedRoomCount) ? Math.abs(r.expectedRoomCount - r.expandedRoomCount) : 0;
    return r.status === 'NOT CLEAR' || !r.roomNumber || countDiff > 2;
  }

  function renderOcrRows() {
    const opts = ['CK OUT','STAY','STAY BACK','CK IN','NOT CLEAR'];
    const errorRows = ocrRows.filter((r,i) => ({ r, i })).map((_, idx) => idx).filter(i => isRowError(ocrRows[i]));
    const hasErrors = ocrRows.some(r => isRowError(r));
    const displayRows = showAllOcrRows ? ocrRows.map((r,i) => i) : ocrRows.map((r,i) => i).filter(i => isRowError(ocrRows[i]));

    const toggleBtn = '<button id="ocrToggleShowAll" style="margin:6px 0 10px;padding:7px 16px;background:#1e3a5f;color:#bfdbfe;border:1px solid #2563eb;border-radius:6px;cursor:pointer;font-size:13px;">' +
      (showAllOcrRows
        ? '🔼 Errors only (' + ocrRows.filter(r => isRowError(r)).length + ' issue' + (ocrRows.filter(r => isRowError(r)).length !== 1 ? 's' : '') + ')'
        : '🔽 Show all rooms (' + ocrRows.length + ')') +
      '</button>';

    const summaryLine = '<div style="padding:7px 0;color:#94a3b8;font-size:13px;">' +
      (hasErrors
        ? '⚠ <strong style="color:#fbbf24">' + ocrRows.filter(r => isRowError(r)).length + ' issue(s)</strong> found — fix before confirming. ' + (showAllOcrRows ? '' : 'Error rows shown below.')
        : ' <strong style="color:#34d399">All rows OK</strong> — no issues found.') +
      ' Total: <strong>' + ocrRows.length + ' rows</strong>, <strong>' + ocrRows.reduce((s,r) => s + r.expandedRoomCount, 0) + ' rooms</strong>.' +
      '</div>';

    roomReview.innerHTML = '<h3 style="margin:14px 0 4px;">AI Rooming Sheet Reader - Review</h3>' +
      (roomAiNote ? '<p style="padding:9px;border:1px solid #2563eb;border-radius:7px;color:#bfdbfe;margin-bottom:6px;">' + escapeHtml(roomAiNote) + '</p>' : '') +
      summaryLine + toggleBtn +
      displayRows.map(i => {
        const r = ocrRows[i];
        const countDiff = Number.isInteger(r.expectedRoomCount) ? Math.abs(r.expectedRoomCount - r.expandedRoomCount) : 0;
        const countText = Number.isInteger(r.expectedRoomCount)
          ? 'ROOMS column: ' + r.expectedRoomCount + ' | Detected: ' + r.expandedRoomCount + ' ' +
            (r.expectedRoomCount === r.expandedRoomCount
              ? '• Count matches'
              : countDiff <= 2
                ? 'ℹ Count close (' + r.expandedRoomCount + ' rooms detected)'
                : '⚠ COUNT MISMATCH — check room numbers')
          : 'Detected rooms: ' + r.expandedRoomCount;
        const expandedPreview = r.roomNumbers && r.roomNumbers.length > 1
          ? '<div style="font-size:12px;color:#94a3b8;margin-top:4px;word-break:break-all;">Rooms (' + r.expandedRoomCount + '): <strong>' + escapeHtml(r.roomNumbers.join(', ')) + '</strong></div>'
          : '';
        const isErr = isRowError(r);
        return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0;padding:10px;background:#131e2c;border:1px solid ' +
          (isErr ? '#b45309' : '#1d2c3e') +
          ';border-radius:8px;">' +
          '<label>Room(s) <input data-ocr-room="' + i + '" value="' + escapeHtml(r.roomNumber) +
          '" style="width:100%;padding:8px;background:#0b121c;color:white;border:1px solid #23364c;border-radius:5px;">' + expandedPreview + '</label>' +
          '<label>Status <select data-ocr-status="' + i + '" style="width:100%;padding:8px;background:#0b121c;color:white;border:1px solid #23364c;border-radius:5px;">' +
          opts.map(o => '<option ' + (r.status === o ? 'selected' : '') + '>' + o + '</option>').join('') +
          '</select></label><div style="padding:8px;color:#cbd5e1;">ETA / Check-in: <strong>' +
          escapeHtml(r.arrivalTime || 'No time found') + '</strong><br>' + escapeHtml(countText) + '</div></div>';
      }).join('') +
      (displayRows.length === 0 ? '<p style="color:#34d399;padding:12px;"> No issues — all rows look good!</p>' : '');

    const toggleEl = document.getElementById('ocrToggleShowAll');
    if (toggleEl) toggleEl.addEventListener('click', () => { showAllOcrRows = !showAllOcrRows; renderOcrRows(); });

    roomReview.querySelectorAll('[data-ocr-room]').forEach(el => el.addEventListener('change', () => {
      const row = ocrRows[Number(el.dataset.ocrRoom)];
      row.roomNumber = el.value.trim();
      row.roomNumbers = expandRoomGroup(row.roomNumber);
      row.expandedRoomCount = row.roomNumbers.length;
      row.countMismatch = Number.isInteger(row.expectedRoomCount) && Math.abs(row.expectedRoomCount - row.expandedRoomCount) > 2;
      renderOcrRows();
    }));
    roomReview.querySelectorAll('[data-ocr-status]').forEach(el => el.addEventListener('change', () => {
      ocrRows[Number(el.dataset.ocrStatus)].status = el.value;
      updateConfirmState();
    }));
    updateConfirmState();
  }

  function updateConfirmState() {
    confirmRoomBtn.disabled = !ocrRows.length || ocrRows.some(r =>
      r.status === 'NOT CLEAR' || !r.roomNumber || (Number.isInteger(r.expectedRoomCount) && Math.abs(r.expectedRoomCount - r.expandedRoomCount) > 2)
    );
  }

  if (roomOcrBtn) roomOcrBtn.addEventListener('click', async () => {
    const file = roomImageInput.selectedRoomFile || (roomImageInput.files && roomImageInput.files[0]) ||
      (roomGalleryInput && roomGalleryInput.files && roomGalleryInput.files[0]);
    if (!file) {
      roomOcrStatus.textContent = tr('selectImage');
      return;
    }
    if (!file.type || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      roomOcrStatus.textContent = tr('validImage');
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      roomOcrStatus.textContent = tr('largeImage');
      return;
    }
    roomOcrBtn.disabled = true;
    roomOcrStatus.textContent = tr('reading');
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the selected image. Please choose it again.'));
        reader.readAsDataURL(file);
      });
      const imageBase64 = String(dataUrl).split(',')[1] || '';
      if (!imageBase64) throw new Error('Image data is empty. Please upload again.');
      const response = await fetch('/api/housekeeping/ai-read-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: file.type })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gemini could not read the image.');
      const allowed = ['CK OUT', 'STAY', 'STAY BACK', 'CK IN', 'NOT CLEAR'];
      ocrRows = (data.rows || []).map(row => {
        const roomNumbers = expandRoomGroup(String(row.roomNumber || ''));
        const expected = Number.isInteger(row.expectedRoomCount) ? row.expectedRoomCount : null;
        const uniqueRooms = [...new Set(roomNumbers)];
        const countDiff = expected !== null ? Math.abs(expected - uniqueRooms.length) : 0;
        return {
          roomNumber: row.roomNumber || uniqueRooms.join(', '),
          roomNumbers: uniqueRooms,
          expectedRoomCount: expected,
          expandedRoomCount: uniqueRooms.length,
          countMismatch: expected !== null && countDiff > 2,
          status: allowed.includes(row.status) ? row.status : 'NOT CLEAR',
          arrivalTime: row.arrivalTime || '',
          confidence: Number(row.confidence) || 0
        };
      }).filter(row => row.roomNumbers.length);
      const usedModel = data.model || 'Gemini AI';
      roomAiNote = `Read directly by ${usedModel} ((AI Vision)). Check every room, status, ETA and ROOMS count before deduction.`;
      roomOcrStatus.textContent = ocrRows.length
        ? `• ${usedModel} found ` + ocrRows.reduce((sum, row) => sum + row.expandedRoomCount, 0) + ' room entries across ' + ocrRows.length + ' rows. Review before confirming.'
        : `${usedModel} could not identify room rows. Please upload a clearer rooming sheet.`;
      renderOcrRows();
    } catch (e) {
      roomOcrStatus.textContent = translateMessage('AI image reading failed: ' + e.message);
      roomReview.innerHTML = '';
      ocrRows = [];
      confirmRoomBtn.disabled = true;
    } finally {
      roomOcrBtn.disabled = false;
    }
  });

  if (confirmRoomBtn) confirmRoomBtn.addEventListener('click', async () => {
    if (!ocrRows.length || ocrRows.some(r => r.status === 'NOT CLEAR' || !r.roomNumber || (Number.isInteger(r.expectedRoomCount) && Math.abs(r.expectedRoomCount - r.expandedRoomCount) > 2))) {
      alert(tr('unclear'));
      return;
    }
    const eligible = ocrRows.filter(r =>
      r.status === 'CK OUT' || r.status === 'STAY BACK' ||
      (r.status === 'CK IN' && !!r.arrivalTime)
    );
    if (!eligible.length) {
      alert(tr('noRooms'));
      return;
    }

    // Deduplicate rooms at deduction time across rows so no room is charged twice
    const seenForDeduct = new Set();
    const roomsToDeduct = [];
    for (const row of eligible) {
      for (const roomNumber of row.roomNumbers) {
        const key = roomNumber.toUpperCase();
        if (!seenForDeduct.has(key)) {
          seenForDeduct.add(key);
          roomsToDeduct.push({
            roomNumber,
            status: row.status,
            arrivalTime: row.arrivalTime || ''
          });
        }
      }
    }

    if (!confirm(tr('confirm') + roomsToDeduct.length + tr('rooms'))) return;

    confirmRoomBtn.disabled = true;
    confirmRoomBtn.textContent = currentLanguage === 'hi' ? 'Processing…' : 'Processing…';
    roomOcrStatus.textContent = tr('processing');
    try {
      const batchId = 'ocr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const res = await fetch('/api/housekeeping/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          rooms: roomsToDeduct,
          
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tr('failed'));

      if (Array.isArray(data.items)) {
        state.items = data.items;
        updateExistingDOM();
      } else {
        await loadFromServer();
      }

      const deductedIds = Object.keys(data.totals || {});
      const itemNames = deductedIds.map(id => {
        const item = state.items.find(entry => entry.id === id);
        return localizedItemName(item ? item.name : id) + ': -' + data.totals[id];
      });
      if (!data.success || deductedIds.length === 0) {
        const shortageList = (data.skippedItems || []).map(x =>
          '<li>' + escapeHtml(localizedItemName(x.name)) + ' — Required: ' + x.required +
          ', Available: ' + (x.available || 0) + ', Short: ' + (x.shortage || x.required) + '</li>'
        ).join('');
        roomOcrStatus.textContent = currentLanguage === 'hi'
          ? 'Deduction unsuccessful: no stock was deducted.'
          : 'Deduction unsuccessful: no stock was deducted.';
        roomReview.innerHTML = '<div style="color:#fca5a5;margin-top:12px;padding:12px;border:1px solid #7f1d1d;border-radius:8px;"><strong>' +
          (currentLanguage === 'hi' ? 'DEDUCTION UNSUCCESSFUL — STOCK SHORTAGE' : 'DEDUCTION UNSUCCESSFUL — STOCK SHORTAGE') +
          '</strong><p>' + (currentLanguage === 'hi' ? 'No product stock was deducted.' : 'No product stock was deducted.') +
          '</p><strong>' + (currentLanguage === 'hi' ? 'Stock shortages:' : 'Stock shortages:') +
          '</strong><ul>' + shortageList + '</ul></div>';
        confirmRoomBtn.disabled = false;
        confirmRoomBtn.textContent = 'Confirm & Deduct Stock';
        return;
      }
      roomOcrStatus.textContent = (data.partial
        ? (currentLanguage === 'hi' ? 'Stock shortage found. Nothing was deducted. ' : 'Stock shortage found. Nothing was deducted. ')
        : '') + tr('success') + data.rooms.length + tr('roomsUpdated');
      const roomReport = (data.roomDetails || []).map(room =>
        '<div style="padding:8px;margin:6px 0;background:#0b1722;border-radius:6px;"><strong>' +
        escapeHtml(room.roomNumber) + ' — ' + escapeHtml(room.status) +
        (room.arrivalTime ? ' (' + escapeHtml(room.arrivalTime) + ')' : '') + '</strong><div>' +
        Object.entries(room.items || {}).map(([id, qty]) => {
          const item = state.items.find(entry => entry.id === id);
          return escapeHtml(localizedItemName(item ? item.name : id)) + ': ' + qty;
        }).join(' · ') + '</div></div>'
      ).join('');
      roomReview.innerHTML = '<div style="color:' + (data.partial ? '#fbbf24' : '#34d399') + ';margin-top:12px;padding:12px;border:1px solid ' + (data.partial ? '#92400e' : '#237a55') + ';border-radius:8px;"><strong>' + (data.partial ? (currentLanguage === 'hi' ? 'DEDUCTION STOPPED — STOCK SHORTAGE' : 'DEDUCTION STOPPED — STOCK SHORTAGE') : (currentLanguage === 'hi' ? 'STOCK SUCCESSFULLY DEDUCTED' : 'SUCCESSFULLY DEDUCTED')) + '</strong><p>' + (currentLanguage === 'hi' ? 'Rooms: ' : 'Rooms: ') +
        escapeHtml(data.rooms.join(', ')) + '</p>' + roomReport + '<p><strong>' + (currentLanguage === 'hi' ? 'Total deducted:' : 'Total deducted:') + '</strong> ' +
        itemNames.map(escapeHtml).join('<br>') + '</p>' + ((data.skippedItems && data.skippedItems.length) ? '<p><strong>' + tr('skipped') + '</strong></p><ul>' + data.skippedItems.map(x => '<li>' + escapeHtml(localizedItemName(x.name)) + ': ' + (x.deducted || 0) + ' / ' + x.required + ' (' + (x.shortage || x.required) + ' short)</li>').join('') + '</ul>' : '') + '</div>';
      confirmRoomBtn.textContent = currentLanguage === 'hi' ? 'Deduction complete' : 'Deduction complete';
    } catch (e) {
      roomOcrStatus.textContent = translateMessage(tr('failed') + e.message);
      confirmRoomBtn.disabled = false;
      confirmRoomBtn.textContent = 'Confirm & Deduct Stock';
      alert('Stock was NOT deducted.\n\n' + e.message + '\n\nPlease check and save the required stock counts, then try again.');
    }
  });
  init();
})();
