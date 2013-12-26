#FitScreen

##关于

FitScreen 是一款用于在移动设备上满屏显示整个网页的js库，并提供额外的配置，如必须竖屏显示、必须横屏显示、允许横竖屏显示、是否允许用户缩放页面等。

它的实现原理是依赖viewport属性，由于不同设备对viewport的设置方法和获取设备物理宽度
的方式存在较大的差异的，所以我们通过对不同平台、不同品牌、不同型号的多种移动设备进行测试，
总结出规律，形成了FitScreen的技术依据。FitScreen定制了相应的提示效果，如你设置了必须竖屏显示，但用户却以横屏浏览您的页面，那么会提示用户以竖屏方式浏览，当然你也是可以定制的。

##使用

### 參數：

 - **pageWidth**：頁面設計稿寬度（px）
 - **cb**：當 fitScreen完畢後，執行的回調函數
 - **isOnlyPortrait【可選】**：
 	- true ：只允許豎屏顯示
 	- false：只允許橫屏顯示
 	- 缺省：允許橫豎屏顯示
 - **errorCallBack【可選】**：
 	- 當isOnlyPortrait = true時，設備橫屏時執行
 	- 當isOnlyPortrait = false時，設備豎屏時執行
	 > 註：
	 > - 當isOnlyPortrait缺省時，errorCallBack無意義 
	 > - 當errorCallBack缺省時，fitScreen会提供默认的处理

 - **isScalable【可選】**：
 	- true：允許拉大頁面 
 	 > 註：不允許縮小頁面 
 	- false 或 缺省：禁止縮放頁面 
 - **isHideAddressBar【可選】**：
 	- true：隐藏地址栏	
 	- false：不隐藏地址栏
 	- 缺省：隐藏地址栏	

##注意事项

###优化显示

为避免缩放的过程使页面闪屏，请在你的样式表中设置
``` css
body{ display:none; }
```

###只允许横屏或竖屏的默认处理

- 只允许竖屏时，当横屏时显示提示信息“建議將手機以直向檢視網頁內容”
- 只允许横屏时，当豎屏时显示提示信息“建議將手機以横向檢視網頁內容”
 > 註：需要css配合，出错提示中的mobile图标使用了font-face实现显示，对低端浏览器不支持该特性。

###只允许横屏或竖屏的自定義处理

- 只需定義errorCallBack，只要符合參數存在這個屬性，fitScreen將取消默認出錯處理，可參見CASE 4

###注意全局變量的衝突

fitScreen全局變量的命名規範都以“ fitScreen_ ” 開頭，暫時持有全局變量

- fitScreen_href
- fitScreen_pageWidth_cssPixels
- fitScreen_lastOrientation
- fitScreen_errorCallBack
- fitScreen_prepareTipHtml
- fitScreen_beforeCallBack
- fitScreen_isError

在書寫自己代碼的時候，避免設立以“ fitScreen_ ” 開頭的全局變量，防止變量衝突。

###注意參數的可選性

fitScreen第一個參數為頁面設計稿寬度，必須要有fitScreen第二個參數為fitScreen完成工作後回調的函數，這個是可選，要用到回調的情況，通常為涉及到獲取元素尺寸的操作，不管是自己書寫的代碼，還是調用第三方庫【例如iscroll】，都需要將這部分代碼放置於回調函數中處理。

###注意fitScreen的調用細節

```js
window.onload = function(){ fitScreen( 1280 ) }; 
```
之所以放置於window.onload，因為 fitScreen本身需要在頁面加載完畢後再設置，放在fitScreen裡面處理，會有風險，當加載fitScreen之前有代碼在頁面加載完畢時依然在運行時，等到fitScreen再加載時會錯過了這個onload事件，導致其不做事的問題。所以最後還是將 window.onload抽到fitScreen外面。

##例子


###CASE 1

 - 允許橫豎屏
 - 禁止縮放

``` js
window.onload = function(){ 
    fitScreen(1280);
}; 
```

###CASE 2

 - 允許橫豎屏
 - 禁止縮放頁面

``` js
var callBack = function(){ 
   // 設置完viewport後的處理
};

window.onload = function(){ 
    fitScreen(1280, {
                      cb : callBack
                    }
    );
}; 
```

###CASE 3

 - 只允許豎屏
 - 允許拉大頁面
 > 註：不允許縮小

``` js
var callBack = function(){ 
    // 設置完viewport後的處理
};

var errorCallBack = function(){
    // 橫屏時處理
    alert('請轉豎屏');
};

window.onload = function(){ 
    fitScreen(1280, {
                      cb : callBack ,
                      isOnlyPortrait : true ,
                      errorCallBack : errorCallBack ,  
                      isScalable : true
                    }
    );
}; 

```

###CASE 4

 - 只允許橫屏
 - 禁止縮放頁面

``` js
var callBack = function(){ 
    // 設置完viewport後的處理
};

var errorCallBack = function(){
    // 豎屏時處理
    alert('請轉橫屏');
};

window.onload = function(){ 
    fitScreen(1280, {
                      cb : callBack , 
                      isOnlyPortrait : false ,
                      errorCallBack : errorCallBack ,  
                      isScalable : false
                    }
    );
}; 
```

###CASE 5

 - 只允許豎屏
 - 采用fitScreen的默认处理
 - 隐藏地址栏

``` js
var callBack = function(){ 
    // 設置完viewport後的處理
};

window.onload = function(){ 
    fitScreen(1280, {
                      cb : callBack
                      ,isOnlyPortrait : true
                      ,isHideAddressBar : true
                    }
    );
}; 
```
