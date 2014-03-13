/*
 * fitZize兼容浏览器
 * 1. 原生浏览器(Android/IOS/WP/MeeGo)[约定系统安装原生, UC, Opera Mobile, Firefox]以及[Android下安裝: Chrome, QQ, 百度, 海豚, 遨游, 天天浏览器]
 * 2. Operal Mobile(在模拟器中测试通过HTC/Samsung/Lenovo/Sony/Nokia/Lg品牌机型)
 * 3. UC
 * 扩展：
 * 1. 辨识移动浏览器与桌面版浏览器
 * 2. 添加其他有用的Meta，如format-detection
*/

/*
 * 功能: 設備特性檢測
 * 标识含义：
 * 稳健：判断依据采用官方推荐做法而且长期不会产生变更，准确性极高
 * 半稳健 ： 判断依据在浏览器兼容范围内保证准确性
 * 临时 ： 单独为某一款设备做hack的做法，未来变更可能性较大，适用周期短
 * 不稳健 ： 在浏览器兼容范围为缩窄到原生浏览器上能保证正确性，需持续关注有无更好方案替换之
 **特别说明 ： 
 * 1. isSamSungPad不稳健，但由于UC提供fitScreen扩展,在设置viewport的过程中完全不依赖该不稳健的判断，所以fitZize在其兼容范围内依然能保证正确性。
 * 2. isDesktop半稳健，属于功能扩展，不是fitZize的正职
*/

/*
 * 防止因點擊href含有'#'的鏈接，導致無法刷新的bug
*/
var fitScreen_href = location.href;

/*
 * 控制是否执行callback函数，当fitScreen_isError为true时，不执行。
*/
var fitScreen_isError = false;

var Detector = function(){
	
    var ua = navigator.userAgent
		
		,isOpera = (/Opera/i).test(ua)
		
		,isAndroid = (/Android/i).test(ua)
		
		,isUC = navigator.appVersion.indexOf("UC")!= -1

		,isMeeGo = (/MeeGo/i).test(ua)
		
		,isWP = (/Windows Phone OS/i).test(ua)
		
		,isIOS = (/Mac OS/i).test(ua)

		
		
		,isChrome = (/Chrome/i).test(ua);
	
	return {
		
		ua_lowerCase : ua.toLowerCase() //稳健_已使用
		
		//设备检测
		,isIPad : (/iPad/i).test(ua) //稳健_已使用
  
		,isIPhoneOrIPod : (/iPhone/i).test(ua) || (/iPod/i).test(ua) //稳健_已使用
		
		,isNexus7 : window.devicePixelRatio == 1.3312499523162842 //临时_已使用
		
		//系统检测
		,isIOS : isIOS //稳健_已使用
		
		,isIOS_gte7 : isIOS && ( parseFloat( ua.substr(ua.indexOf('Version') + 8,3) ) >= 7 ) // 是否IOS7或以上版本

		,isAndroid : isAndroid //稳健_已使用
		
		,isWP : isWP //稳健_已使用
		
		,isMeeGo : isMeeGo //稳健_已使用
		
		//浏览器检测
		,isUC : isUC //稳健_已使用
		
		,isOpera : isOpera //稳健_已使用
		
		,isIE : (/MSIE/i).test(ua) //稳健_未使用 
		
		,isChrome : (/Chrome/i).test(ua) && ( (/SAMSUNG/i).test(ua) == false ) //稳健_已使用

		,isAndroidOriginalBrowser : isAndroid && !isUC && !isOpera //半稳健_已使用	  除了UC Opera Mobile/HD 还有其他浏览器，如QQ浏览器等
		
		,isDesktop : !isWP && !isIOS && !isAndroid && !isMeeGo && !(/Opera Mobi/i).test(ua) //半穩健_已使用 手机系统还有塞班等

		,isSamSungPad : window.devicePixelRatio == 1 && !isIOS && window.outerWidth > 480 //不穩健_已使用 Android下的UC等瀏覽器也可能與此判斷匹配

		,isFirefox : (/Firefox/i).test(ua) //稳健_已使用

		,isWebkit : (/WebKit/i).test(ua) //稳健
	}

}();

/*
 * 功能: 获取是否横屏
 * 参数: N/A
 ***返回值[boolean]***
 * 横屏: true
 * 竖屏: false
*/
var getIsLandscape = function(){
	
  var isLandscape = false
	  
	  ,orientation = window.orientation
	  
	  ,landscape_map = { "90": true, "-90": true }

	  ,portrait_map = { "0": true, "180": true };	  
  
  landscape_map[orientation] && (isLandscape = true);

  if( Detector.isChrome ){ 
  	 /*
		window.orientation在选项卡隐藏到显示，只会显示隐藏时的旧数据
		window.innerWidth在选项卡隐藏到显示，依然取最新数据
  	 */
  	 isLandscape = window.innerWidth > window.innerHeight ? true : false;
  }
  //三星平板 
  else if( Detector.isSamSungPad ){

  	portrait_map[orientation] && (isLandscape = true);

	landscape_map[orientation] && (isLandscape = false);

  }
  
  return isLandscape;

};

/*
 * 功能: 获取安卓系统版本(首位数字)
 * 参数: N/A
 ***返回值[number/NaN]***
 * 非安卓系统: NaN  
 * 安卓系统: 1, 2, 3, 4...
*/
var getAndroidVersion = function(){
  
  if( Detector.ua_lowerCase.indexOf("android") == -1 ) return NaN; 
  
  //版本号首位数字在ua字符串中的位置
  var versionIdx = Detector.ua_lowerCase.indexOf("android") + 8;
 
  var version = parseFloat( Detector.ua_lowerCase.substring(versionIdx,versionIdx+3));
	 
  return version;
  
};

/*
 * 功能: 获取Android设备的分辨率
 * 参数: N/A
 ***返回值[int/undefined]***
 * Android/MeeGo:
 * 横屏获取横向分辨率  
 * 纵向获取纵向分辨率
 * WP/IOS: undefined
*/
var getAndroidDeviceResolution = function(){ 

  var resolution
	   
       ,isLandscape = getIsLandscape()

       ,android_version = getAndroidVersion();

  if( Detector.isAndroid || Detector.isMeeGo ){
	
	  // Android 3-
	  if( android_version < 3 ){
		  
	  	resolution = window.outerWidth;
		
	  }
	  // Android 3+ ~ 4.3-
	  else if( android_version < 4.3 ){
	  	
		resolution = screen.width;

		//无法获取正确值，故无耐采用硬编码 
	    Detector.isNexus7 && isLandscape && ( resolution = 1280 );	  	
	  	
	  }
	  // Android 4.3+ (为了获取三星NOTE3的准确分辨率)
	  else{
        
	  	resolution = window.outerWidth * window.devicePixelRatio;
			  
	  } 	

  }
  
  /*
	注析代码原因：
	chrome于2013年4月3日宣布使用Blink内核，同年6月正式使用
	其screen.width读书与IOS一致，均为屏幕物理像素宽度，无需先计算分辨率。

  if( Detector.isChrome ){ 
	  
	  resolution = screen.width;   
	  
	  isLandscape &&  ( resolution = screen.height ); 

  }*/

  return resolution;
  
} 

/*
 * 功能: 获取设备宽度cssPexels
 * 参数: N/A
 ***返回值***
 * WP: undefined
 * Android/IOS/MeeGo: number
*/
var getDeviceWidth_cssPixels = function(){
	
  var androidDeviceResolution = getAndroidDeviceResolution()
    
	  ,deviceWidth_cssPixels;
  
  /* 先特定浏览器，再特定平台（针对平台原生浏览器） */
  if( Detector.isChrome ){
  	
  	  /* 1.网页选项卡处于显示状态下，转屏screen.width读数正确
		 非显示状态下，转屏后隐藏选项卡的screen.width依旧为旧的读数，
		 除了window.innerWidth/window.innerHeight会实时获取。

		 2.chrome浏览器 与 chrome WebView区别
		   * 当没有提供 window.devicePixelRatio 时，screen.width读数意义一般为分辨率
		     对应场景：新内核 chrome 浏览器（旧版本不需理会，chrome底层强制更新内核的）
		   * 当不提供 window.devicePixelRatio 时，screen.width读数意义一般为物理像素值
		     对应场景：chrome WebView（4.4版本的WebView，还没有摒弃window.devicePixelRatio属性，依旧为旧内核做法）
  	  */	
  	  deviceWidth_cssPixels = getIsLandscape() ? Math.max( screen.width, screen.height ) : Math.min( screen.width, screen.height );
  	  if( typeof window.devicePixelRatio == 'number' ){
  	  	deviceWidth_cssPixels = deviceWidth_cssPixels / window.devicePixelRatio;
  	  }
  }
  else if( Detector.isIOS ){

  	  deviceWidth_cssPixels = getIsLandscape() ? screen.height : screen.width;

  }
  else if( Detector.isAndroid || Detector.isMeeGo ){
	
	  deviceWidth_cssPixels = androidDeviceResolution / window.devicePixelRatio;
	  
	  
  }
  
  return deviceWidth_cssPixels;
  
}

/*
 * 功能: 获取缩放比
 * 依賴: fitScreen_pageWidth_cssPixels 全局变量
 * 参数: N/A
 ***返回值***
 * WP: undefined
 * Android/IOS: number
*/
var getScale = function(){

  var deviceWidth_cssPixels = getDeviceWidth_cssPixels()
  
      ,scale;
  
  if( typeof deviceWidth_cssPixels == 'number' ){
  
  	scale = deviceWidth_cssPixels / fitScreen_pageWidth_cssPixels;
   
  }
  
  return scale;

}

/*
 * 功能: 设置viewPort content属性
 * 依賴: fitScreen_pageWidth_cssPixels 全局变量
 * 参数: viewPort object
 ***返回值[N/A]***
*/
var setViewPortCnt = function( viewPort, options ){ 

  //Ipad 需要width設置為頁面設計稿寬度,Android可以設為device-width 
  var viewPortCnt = 'width=' + fitScreen_pageWidth_cssPixels;

  //UC瀏覽器
  if( Detector.isUC ){
    
	viewPortCnt += ', uc-fitscreen=yes, user-scalable=' + ( options.isScalable ? 'yes' : 'no' );
	
  }
  else if( Detector.isWP ){

  	viewPortCnt += ', initial-scale=1.0, minimum-scale=1.0' + ( options.isScalable ? '' : ', maximum-scale=1.0' );
    
  }
  // Android[不考虑安装Chrome,Safari] or IOS[不考虑安装Chrome] or MeeGo
  else{
	  
      var scale = getScale();
	  
	  viewPortCnt += ', initial-scale=' + scale + ', minimum-scale=' + scale 
				  + ( options.isScalable ? '' : ', maximum-scale=' + scale ); 			
	  
	  if( Detector.isIPhoneOrIPod ){
		
		if( Detector.isIOS_gte7 ){
			// IOS7+ : IOS7只需设置width=device-width, user-scalable=false达到fitScreen，且可固定浏览器窗体。
			// 采用IOS5的做法会导致浏览器窗体随手指移动。
			viewPortCnt += ', user-scalable=' + ( options.isScalable ? 'true' : 'false' );
		}else{  
			//IOS5 Iphone 豎屏刷新,轉橫屏後viewport寬度偏大問題  
			viewPortCnt = 'initial-scale=' + scale + ', minimum-scale=' + scale 
						+ ( options.isScalable ? '' : ', maximum-scale=' + scale ); 
		}
		
	  }

  }
  viewPort.setAttribute('content', viewPortCnt); 
  
}

/*
 * 功能: 放置好viewport
 * 参数: N/A
 ***返回值[obj]***
 * viewPort 
*/
var placeViewPort = function(){
	
	var viewPort = document.getElementsByName('viewport')[0];
	
	if( viewPort === undefined || viewPort === null ){ 
	
	    var head = document.getElementsByTagName('head')[0];

		viewPort = document.createElement("meta"); 
	
		viewPort.setAttribute('name','viewport');
		
		head.appendChild(viewPort);
		
	};
	
	return viewPort;
	
}

 /*
 * 功能: 放置好其他有用的Meta
 * 参数: N/A
 ***返回值[N/A]***
*/
var placeOtherMeta = function(){

    var format_detection = document.getElementsByName('format-detection')[0];

	if( format_detection === undefined || format_detection === null ){ 

		var head = document.getElementsByTagName('head')[0];

		format_detection = document.createElement("meta");

		format_detection.setAttribute('name','format-detection');

		format_detection.setAttribute('content','telephone=no');
    
	    head.appendChild(format_detection);
        
	}
	 
}

/*
 * 功能: 清除timeout句柄ID
 * 参数: timeOutID array
 ***返回值[N/A]***
*/
var clearTimeOutID = function( timeOutID ){
	
	if( timeOutID.length > 0 ){
		
		for( var i = 0; i < timeOutID.length; i++ ){
			
			clearTimeout( timeOutID.pop() );
			
		} 	
		
	}
	
}

//保存延迟执行代码句柄ID
var timeOutID = [];

/*
 * 功能: 设置viewport
 * 依賴: timeOutID 全局變量
 * 参数: viewPort obj,cb 设置好viewport后的回调函数
 ***返回值[N/A]***
*/
var setViewPort = function(viewPort, cb, options){
	
	//避免快速转屏导致堆积延迟执行代码
	clearTimeOutID(timeOutID);
	
	var head = document.getElementsByTagName('head')[0];
	
	if( viewPort.getAttribute('content') == undefined ){
		
		setViewPortCnt(viewPort, options);
		
		typeof cb == 'function' && cb();
	
	}else if( Detector.isAndroidOriginalBrowser || Detector.isIOS ){
		
		//代码延迟执行时间
		var codeDelayTime = 250;	
		
		//平板SUPERPAD
		timeOutID.push( setTimeout( function(){
			
			//保证在刷屏动作之前移除viewPort
			head.removeChild(viewPort);
			
			//平板SAMSUNG GT-N8000 
			//timeOutID.push( setTimeout( function(){ location.replace(location.href); }, codeDelayTime) );	
			timeOutID.push( setTimeout( function(){ location.replace( fitScreen_href ); }, codeDelayTime) );
			
		}, codeDelayTime) );	
		
	}else if( Detector.isOpera ){
		
		head.removeChild(viewPort);
		
		location.replace( fitScreen_href );
		
	}
	
}

/*
 * 功能: 檢測fitScreen_pageWidth_cssPixels是否配置好
 * 参数: N/A
 ***返回值[boolean]***
 * 配置成功: true
 * 配置異常: false
*/
var checkPageWidth = function(){
	
	if( fitScreen_pageWidth_cssPixels === undefined || fitScreen_pageWidth_cssPixels === null ) {
		
		alert( "'fitScreen_pageWidth_cssPixels' 配置項未定義, 請定義後再試! " ); return false;
		
	}else if( typeof fitScreen_pageWidth_cssPixels != 'number' ){
		
		alert( "'fitScreen_pageWidth_cssPixels' 配置項不是數字類型, 請重新配置後再試! " ); return false;
		
	}else if( isNaN(fitScreen_pageWidth_cssPixels) ){
		
		alert( "'fitScreen_pageWidth_cssPixels' 配置項不能為NaN, 請重新配置後再試! " ); return false;
			
	}else if( fitScreen_pageWidth_cssPixels < 0 ){
		
		alert( "'fitScreen_pageWidth_cssPixels' 配置項不能為負數, 請重新配置後再試! " ); return false;
		
	}
	
	return true;
	
}

var placeViewPortForFF = function(){
	
	var viewPort = document.getElementsByName('viewport')[0];
	
	if( viewPort === undefined || viewPort === null ){ 
	
	    var head = document.getElementsByTagName('head')[0];

		viewPort = document.createElement("meta"); 
	
		viewPort.setAttribute('name','viewport');
		
		//viewPort.setAttribute('content','width=60,user-scalable=no');
		// firefox新版本对viewport的语法，user-scalable=no先将比例拉大后再锁屏。
		viewPort.setAttribute('content','width=' + fitScreen_pageWidth_cssPixels );

		head.appendChild(viewPort);
		
	};
	
}

//記錄最近一次window.orientation
var fitScreen_lastOrientation = 0;

/*
 * 功能: 处理页面fit Size
 * 依賴: fitScreen_lastOrientation 全局變量
 * 参数: cb, 外部傳入的回調函數
 ***返回值[N/A]***
*/
var fitSize = function( options ){
	
	if( !checkPageWidth() ) return;
	
	if( !Detector.isOpera ){
		
		//是否第一次打开页面或刷新页面
		var isFirstIn = document.getElementsByName('viewport')[0] == undefined;
	
		//三星手機GT-S5830做優化
		if( window.orientation == fitScreen_lastOrientation && !isFirstIn ) return; 
		
		fitScreen_lastOrientation = window.orientation;
		
	}
	
	placeOtherMeta();
	
	var body = document.getElementsByTagName('body')[0];
	
	body.style.display = 'none';
   
	setViewPort( placeViewPort(), function(){ 
	
		body.style.display = 'block'; 

		if( fitScreen_isError == false ){

			fitScreen_beforeCallBack(options);

		}

		if( typeof options.cb == 'function' ) {

			options.cb();
		}

	}, options );
	
}

/*
 * 功能: 定制只允许竖屏/横屏下的出错处理
 ***返回值[N/A]***
*/
var fitScreen_errorCallBack = function(){
	var info_box = document.getElementById('fitScreen_info_box')
		,body = document.getElementsByTagName('body')[0]
		,wrap = document.getElementById('wrap');//body.children[0];
    
    if( !!info_box && !!wrap ){
	    wrap.style['display'] = 'none';
	    info_box.style['display'] = 'block';
	}
}

/*
 * 功能: 定制只允许竖屏/横屏下的出错提示（html部分）
 ***返回值[N/A]***
*/
var fitScreen_prepareTipHtml = function(isOnlyPortrait){
	if( !!document.getElementById('fitScreen_info_box') == false ){
		var strHtml = ''
			,body = document.getElementsByTagName('body')[0]
			,div = document.createElement("div")
			,tip_txt = isOnlyPortrait ? '直向' : '橫向';

		strHtml = "<div id='fitScreen_info_box' class='fitScreen_info_box'><span class='j_icon j_mobile-phone'></span><strong>建議將手機以" + tip_txt + "檢視網頁內容</strong></div>";
		div.innerHTML = strHtml;
		body.appendChild(div.children[0]);
	}
}

/*
 * 功能: 使用了fitScreen定制的出错处理，在callback调用（没出错时）前要将提示部分隐藏，内容显示
 ***返回值[N/A]***
*/
var fitScreen_beforeCallBack = function(options){
    if( typeof options.isOnlyPortrait == 'boolean' 
    	&& typeof options.errorCallBack != 'function' ){
		var info_box = document.getElementById('fitScreen_info_box')
			,body = document.getElementsByTagName('body')[0]
			,wrap = document.getElementById('wrap');//body.children[0];
	    
	    if( !!info_box && !!wrap ){
		    wrap.style['display'] = 'block';
		    info_box.style['display'] = 'none';
		}
	}
}


/**********************************
			 代码执行部分
***********************************/

//页面设计稿宽度,单位CSS Pixels
var fitScreen_pageWidth_cssPixels = 640;

//轉屏/resize公用事件名稱
var supportsOrientationChange = "onorientationchange" in window
	,orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

/*
 * 功能: 對外傳入一個回調參數
 * 参数: pageWidth 页面设计稿宽度
 * 可選參數: options jason
 *       cb 成功設置viewport後，回調
 *       errorCallBack 橫豎屏違反只顯示於橫屏或豎屏模式，回調
 *		 isOnlyPortrait true:只允許豎屏顯示 false:只允許橫屏顯示
 *		 isScalable 用戶是否可縮放
 *		 isHideAddressBar 默认隐藏，仅当options.isHideAddressBar == false时不隐藏地址栏
 ***返回值[N/A]***	
*/
var fitScreen = function( pageWidth, options ){
 		
	//window.onload = function(cb){
        
		options = options == void 0 ? {} : options;				
		
		fitScreen_pageWidth_cssPixels = pageWidth;
		
		//移動設備
		if(	true ){ // !Detector.isDesktop

			if( options.isHideAddressBar == true || options.isHideAddressBar == void 0 ){
                // 隐藏地址栏
                setTimeout(function(){
                    window.scrollTo(0, 0);
                }, 0);
			}
 
			// 橫豎屏單一模式處理
			if( typeof options.isOnlyPortrait == 'boolean' ){
				
				window.addEventListener( orientationEvent, function(){ fitScreen( pageWidth, options ); }, false );

				var isLandscape = getIsLandscape();

				// 定制只允许竖屏/横屏下的出错提示（html部分）
				if( typeof options.errorCallBack != 'function' ){
					// 用户在没有自定义出错处理函数，才使用fitScreen定制的处理
					fitScreen_prepareTipHtml(options.isOnlyPortrait);
				}

				if( options.isOnlyPortrait ){
					if( isLandscape ){
						typeof options.errorCallBack == 'function' ? options.errorCallBack() 
							: fitScreen_errorCallBack();
						fitScreen_isError = true;
						//return; 
					}
				}else{
					if( !isLandscape ){ 
						typeof options.errorCallBack == 'function' ? options.errorCallBack() 
							: fitScreen_errorCallBack();
						fitScreen_isError = true;
						//return; 
					}			
				}
			}
			
			//移動設備的firefox
			if( !Detector.isDesktop && Detector.isFirefox ){ 
						
				placeViewPortForFF();

				var body = document.getElementsByTagName('body')[0];
				
				body.style.display = 'block';
			
			}
			else{
				
				fitSize( options );

				//Opera Mobile模拟器发现部分设备的Opera不支持onorientationchange事件,如Nokio N800

				window.addEventListener( orientationEvent, function(){ 
					fitSize( options ); 
				}, false);
			}

		}
		//桌面版
		else{		
			
			alert( "本頁面不支持桌面版瀏覽器，請用移動瀏覽器打開本頁面" );

		}

		/*
		 * 功能: 檢測標籤頁是否正在被瀏覽[已应用于新版Chrome]
		 * 支持: 需支持页面可视性 (Page Visibility) API
		 * Android 不支持,IOS 不支持,
		 * Opera Mobile for Android 12.1支持
		 * Chrome blink内核支持
		 * 参数: N/A
		 ***返回值[N/A]***
		 ***参考 isVis
		 * 应用场景举例：
		 * 最近一次打开页面xx.html为竖屏，切换到其他网页选项卡后转横屏，在横屏状态下重新切换xx.html页面
		 * 此时要做处理，要重设viewport。处理时机为visibilitychange被触发且document['hidden'] == false。
		*/
		var vendor = Detector.isWebkit ? "webkit":
				      Detector.isFirefox ? "Moz": 
					  Detector.isIE ? "ms":
					  "" 
			,DOCUMENT_HIDDEN_ATTR = document['hidden'] !== undefined ? 'hidden' 
			                           : document[vendor.toLowerCase() + 'Hidden'] !== undefined ? vendor.toLowerCase() + 'Hidden' 
			                           : undefined
		    ,visibilitychange = document['hidden'] !== undefined ? 'visibilitychange'
		                         : document[vendor.toLowerCase() + 'Hidden'] !== undefined ? vendor.toLowerCase() + 'visibilitychange' 
		                         : undefined;
		                         
		document.addEventListener(visibilitychange, function(){
			var is_doc_show = DOCUMENT_HIDDEN_ATTR !== undefined ? !document[DOCUMENT_HIDDEN_ATTR] : true
			if( is_doc_show ){
				//重设viewport
				var head = document.getElementsByTagName('head')[0];
				var viewPort = document.getElementsByName('viewport')[0];
				head.removeChild( viewPort );
				location.replace( fitScreen_href );
			}
		}, false);		

	//};

}