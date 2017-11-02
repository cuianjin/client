/**
 * 实用工具
 * amd模块，使用requirejs载入
 */

define([
	'http',
	'config'
], function(http, config) {
	return {
		/**
		 * table操作实用工具
		 */
		table: {
			/**
			 * 常用 formatter
			 */
			formatter: {
				/**
				 * 图片url转成缩略图
				 */
				urlToThumb: function(val, position) {
					if (val) {
						position = position || 'left'
						return '<a href="' + val + '" class="thumb-area" target="_blank">' +
							'<span class="thumb fa fa-picture-o text-light-blue"></span>' +
							'<img src="' + val + '" class="thumb-' + position + '" />' +
							'</a>'
					} else {
						return ''
					}
				},
				/**
				 * 图片缩略图
				 */
				thumbImg: function(url) {
					if (url) {
						return '<img src="'+ url +'" class="table_thumbImg">'
					} else {
						return ''
					}
				},
				/**
				 * timestamp转成时间格式字符串
				 */
				timestampToDate: function(val, format) {
					return moment(val).format(format)
				},
				/**
				 * 数字转成进度条
				 */
				numberToProgress: function(val) {
					val = parseInt(val * 100)
					if (val <= 30) {
						return '<div class="progress progress-xs progress-striped active">' +
							'<div class="progress-bar progress-bar-primary" style="width: ' + val + '%"></div>' +
							'</div>'
					} else if (val > 30 && val <= 60) {
						return '<div class="progress progress-xs progress-striped active">' +
							'<div class="progress-bar progress-bar-danger" style="width: ' + val + '%"></div>' +
							'</div>'
					} else if (val > 60 && val <= 99) {
						return '<div class="progress progress-xs progress-striped active">' +
							'<div class="progress-bar progress-bar-yellow" style="width: ' + val + '%"></div>' +
							'</div>'
					} else {
						return '<div class="progress progress-xs progress-striped active">' +
							'<div class="progress-bar progress-bar-success" style="width: ' + val + '%"></div>' +
							'</div>'
					}
				},
				/**
				 * 数字转成百分比显示
				 */
				numberToPercentage: function(val) {
					val = parseInt(val * 100)
					if (val <= 30) {
						return '<span class="badge bg-light-blue">' + val + '%</span>'
					} else if (val > 30 && val <= 60) {
						return '<span class="badge bg-red">' + val + '%</span>'
					} else if (val > 60 && val <= 99) {
						return '<span class="badge bg-yellow">' + val + '%</span>'
					} else {
						return '<span class="badge bg-green">' + val + '%</span>'
					}
				},
				/**
				 * 生成功能按钮
				 */
				generateButton: function(arr, tableId) {
					if (!tableId) {
						throw "generateButton方法未添加tableId！"
						return
					}
					var format = '<div class="func-area">'
					arr.forEach(function(item) {
						switch (item.type) {
							case 'button':
								if ((item.isRender === undefined || item.isRender) && shouldRender(config.currentMenu.buttons, tableId, item.class)) {
									format += '<button class="btn btn-default btn-xs ' + item.class + '">' + item.text + '</button>'
								}
								break
							case 'buttonGroup':
								if ((item.isRender === undefined || item.isRender) && shouldRender(config.currentMenu.buttons, tableId, item.class)) {
									var substr = ''
									item.sub.forEach(function(sub) {
										if ((sub.isRender === undefined || sub.isRender) && shouldRender(config.currentMenu.buttons, tableId, sub.class)) {
											substr+='<li><a href="javascript:void(0)" class="' + sub.class + '">' + sub.text + '</a></li>'
										}
									})
									if(substr){
										format += '<div class="btn-group ' + (item.isCloseBottom ? 'dropup' : '') + '">' +
										'<button class="btn btn-default btn-xs ' + item.class + '">' + item.text + '</button>' +
										'<button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown">' +
										'<span class="caret"></span>' +
										'</button>' +
										'<ul class="dropdown-menu dropdown-menu-right" role="menu">';
										format +=substr+ '</ul></div>'
									}
								}
								break
						}
					})
					format += '</div>'
					return format


					function shouldRender(buttons, tableId, itemClass) {
						if (buttons) {
							for (var i = 0, bl = buttons.length; i < bl; i += 1) {
								var bi = buttons[i]
								if (bi.position === 'table') {
									if (bi.tableId === tableId && bi.className === itemClass && bi.authorize == true) {
										if (bi.status === 'DISABLE') {
											return false
										}
										return true
									}
									if (bi.tableId === tableId && bi.className === itemClass && bi.authorize == false) {
										return false
									}
								}
							}
						}
						return true
					}
				},
				/**
				 * 格式化风险等级
				 * @param {Object} val
				 */
				convertRisk: function(val) {
					var str = '',
						className = '';
					var wl = this.getWarrantyLevel(val);
					if (wl) {
						return this.convertRiskLevel(wl.wlevel, wl.name);
					} else {
						return this.convertRiskLevel(null);
					}
					return str;
				},
				/**
				 * 根据分数值获取风险等级配置项
				 * @param {Object} val
				 */
				getWarrantyLevel: function(val) {
					if (val === null || val === undefined || val.toString().trim() === '') return null;
					var levelOptions = config.warrantyLevelOptions;
					if (levelOptions) {
						for (var i = 0; i < levelOptions.length; i++) {
							var item = levelOptions[i];
							var f0 = item.coverLow,
								f1 = item.coverHigh;
							var min = item.lowFactor,
								max = item.highFactor;
							if (!max || max === '∞') {
								if (f0 === '[') {
									if (val >= min)
										return item;
								} else {
									if (val > min)
										return item;
								}
							} else if (!min || min === '∞') {
								if (f1 === ']') {
									if (val <= max)
										return item;
								} else {
									if (val < max)
										return item;
								}
							} else {
								if (f0 === '[') {
									if (f1 === ']') {
										if (min <= val && val <= max)
											return item;
									} else {
										if (min <= val && val < max)
											return item;
									}
								} else {
									if (f1 === ']') {
										if (min < val && val <= max)
											return item;
									} else {
										if (min < val && val < max)
											return item;
									}
								}
							}
						}
					}
					return null;
				},
				/**
				 * 格式化风险等级
				 * @param {Object} val  风险等级
				 * @param {Object} display 显示名称
				 */
				convertRiskLevel: function(val, display) {
					// 'LOW' || 'L'  低风险
					// 'MID' || 'M'  中风险
					// 'HIGH' || 'H' 高风险
					var str = '';
					var className = '';
					if (!val || val === 'NONE') {
						str = display || '无'
						className = 'bg-green'
					} else if (val === 'LOW' || val === 'L') {
						str = display || '低'
						className = 'bg-blue'
					} else if (val === 'MID' || val === 'M') {
						str = display || '中'
						className = 'bg-yellow'
					} else {
						str = display || '高'
						className = 'bg-red'
					}
					return '<span style="padding: 1px 15px;" class="' + className + '">' + str + '</span>';
				}
			}
		},
		/**
		 * 枚举值操作实用工具
		 */
		enum: {
			/**
			 * 转换（类似vue/angular中的filter）
			 */
			transform: function(enumName, val) {
				var rlt = ''
				if (config[enumName] && Object.prototype.toString.call(config[enumName]) === '[object Array]') {
					config[enumName].forEach(function(item) {
						if (item.id === val) {
							rlt = item.text
						}
					})
				} else {
					console.warn('未定义的枚举值:' + enumName)
				}
				
				return rlt
			}
		},
		/**
		 * 表单操作实用工具
		 */
		form: {
			/**
			 * 重置表单
			 * @param form 表单 jquery对象
			 */
			reset: function(form) {
				var selects = form.find('select')
				var ichecks = form.find('.icheck')
				var select2s = form.find('.origin-select')
				form.resetForm()
				selects.each(function(index, item) {
					$(item).change()
				})
				ichecks.iCheck('update').each(function(index, item) {
					if (item.checked) {
						$(item).trigger('ifChecked')
					}
				})
				select2s.each(function(index, item) {
					$(item).select2('val', '')
				})
			},
			/**
			 * 表单验证工具
			 */
			validator: {
				init: function(form) {
					form.validator({
						custom: {
							validfloat: this.validfloat,
							validfloatforplus: this.validfloatforplus,
							validint: this.validint,
							validfloatrange: this.validfloatrange,
							validpositive: this.validpositive,
							validjpgpng: this.validjpgpng,
							validbank: this.validbank,
							validmobileno: this.validmobileno,
							validphoneno: this.validphoneno,
							valididno: this.valididno,
							validdateafter: this.validdateafter,
							validdatebefore: this.validdatebefore
						},
						errors: {
							validfloat: '数据格式不正确',
							validfloatforplus: '数据格式不正确',
							validint: '数据格式不正确',
							validfloatrange: '数据格式不正确',
							validpositive: '数据必须为自然数',
							validjpgpng: '图片格式仅限JPG、PNG,只可上传一张',
							validbank: '银行卡格式不正确',
							validmobileno: '手机号格式不正确',
							validphoneno: '电话号格式不正确，请输入区号+座机号，中间不分隔',
							valididno: '身份证号不正确',
							validdateafter: 'xxx',
							validdatebefore: '数据格式不正确'
						}
					})
				},
				/**
				 * 浮点数校验，例如 data-validfloat="10.2"，10.2 表示小数点前面10位后面2位，默认前后各10位
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 * FIXME 目前默认值不起作用，框架导致，待修改
				 */
				validfloat: function($el) {
					var value = $el.val().trim()
					var range = $el.attr('data-validfloat') || '10.10'
					var rangeArr = range.split('.')
					var intPart = rangeArr[0]
					var decPart = rangeArr[1]
					var regStr = '^[+-]?\\d{0,' + intPart + '}(\\.\\d{0,' + decPart + '})?$'
					var floatReg = new RegExp(regStr)
					if (!floatReg.test(value)) {
						return false
					} else {
						return true
					}
				},
				/**
				 * 正浮点数校验，例如 data-validfloat="10.2"，10.2 表示小数点前面10位后面2位，默认前后各10位
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 * FIXME 目前默认值不起作用，框架导致，待修改
				 */
				validfloatforplus: function($el) {
					var value = $el.val().trim()
					var range = $el.attr('data-validfloat') || '10.10'
					var rangeArr = range.split('.')
					var intPart = rangeArr[0]
					var decPart = rangeArr[1]
					var regStr = '^[+]?\\d{0,' + intPart + '}(\\.\\d{0,' + decPart + '})?$'
					var floatReg = new RegExp(regStr)
					if (!floatReg.test(value)) {
						return false
					} else {
						return true
					}
				},
				/**
				 * 整数校验，例如 data-validint="1-1000"，1-1000 表示许可范围从1到1000
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 * FIXME 目前默认值不起作用，框架导致，待修改
				 */
				validint: function($el) {
					var value = $el.val().trim()
					var range = $el.attr('data-validint') || '0-1000000000'
					var rangeArr = range.split('-')
					var start = Number(rangeArr[0])
					var end = Number(rangeArr[1])
					//var regStr = '^[+-]?\\d*$'
					var regStr = '^(0|[1-9][0-9]*)$'
					var intReg = new RegExp(regStr)
					if (!intReg.test(value)) {
						return false
					} else {
						if (parseInt(value) > end || parseInt(value) < start) {
							return false
						} else {
							return true
						}
					}
				},
				/**
				 * 浮点校验，例如 data-validfloatrange="4-2-0-1000"，4-2表示小数点前面4位后面两位，默认前后各10位，0-1000 表示许可范围从0到1000，默认范围0-1000000000
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 * FIXME 目前默认值不起作用，框架导致，待修改
				 */
				validfloatrange: function($el) {
					var value = $el.val().trim()
					var range = $el.attr('data-validfloatrange') || '10-10-0-1000000000'
					var rangeArr = range.split('-')
					var intPart = rangeArr[0]
					var decPart = rangeArr[1]
					var start = parseFloat(rangeArr[2])
					var end = parseFloat(rangeArr[3])
					var regStr = '^[+-]?\\d{0,' + intPart + '}(\\.\\d{0,' + decPart + '})?$'
					var floatReg = new RegExp(regStr)
					if (!floatReg.test(value)) {
						return false
					} else if (parseFloat(value) > end || parseFloat(value) < start) {
						return false
					} else {
						return true
					}
				},
				/**
				 * 非负数校验 大于零：data-validpositive="non-zero" 大于等于零：data-validpositive="true"
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validpositive: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var type = $el.attr('data-validpositive')
					switch (type) {
						case 'non-zero':
							return Number(value) > 0
						default:
							return Number(value) >= 0
					}
				},
				/**
				 * jpg,png图片校验：data-validjpgpng="jpgpng"
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validjpgpng: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var jpgpng = $el.attr('data-validjpgpng')
					var idx = value.lastIndexOf(".")
					var filenameLen = value.length
					var postf = value.substring(idx, filenameLen).toLowerCase()
					if (jpgpng === "jpgpng") {
						if (postf === ".jpg" || postf === ".png") {
							return true
						} else {
							return false
						}
					} else {
						return false
					}
				},
				/**
				 * 16到19位银行卡号纯数字校验：data-validbank="bankno"
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validbank: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var bankno = $el.attr('data-validbank')
					var banknoReg = /^(\d{16,19})$/
					if (bankno === "bankno") {
						if (banknoReg.test(value)) {
							return true
						} else {
							return false
						}
					} else {
						return false
					}
				},
				/**
				 * 手机号校验：data-validmobileno="mobileno"
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validmobileno: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var mobileno = $el.attr('data-validmobileno')
					var mobilenoReg = /^1[3|4|5|7|8][0-9]{9}$/
					if (mobileno === "mobileno") {
						if (mobilenoReg.test(value)) {
							return true
						} else {
							return false
						}
					} else {
						return false
					}
				},
				/**
				 * 电话号校验：data-validphoneno="phoneno"
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validphoneno: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var phoneno = $el.attr('data-validphoneno')
						//					var phonenoReg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,8}$/
					var phonenoReg = /^(\d{11,12})$/
					if (phoneno === "phoneno") {
						if (phonenoReg.test(value)) {
							return true
						} else {
							return false
						}
					} else {
						return false
					}
				},
				/**
				 * 身份证号校验：data-valididno="idno"
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				valididno: function($el) {
					var value = $el.val().replace(/ /g, "").replace(/(^\s*)|(\s*$)/g, "") //去掉字符串头尾空格
					if (!value) {
						return true
					}
					var idno = $el.attr('data-valididno')
					if (idno === "idno") {
						if (value.length === 18) { //验证18位身份证号
							var province = value.substr(0, 2) //身份证号前两位省份
							if (config.idCity[province] === undefined) { //身份证省份是否有效
								return false
							} else {
								var year = value.substring(6, 10)
								var month = value.substring(10, 12)
								var day = value.substring(12, 14)
								var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day))
									//这里用getFullYear()获取年份，避免千年虫问题
								if (temp_date.getFullYear() === parseFloat(year) && temp_date.getMonth() === parseFloat(month) - 1 && temp_date.getDate() === parseFloat(day)) { //验证生日是否有效   
									var arr_idCard = value.split("") //得到身份证数组
									var sum = 0 //声明加权求和变量
									if (arr_idCard[17].toLowerCase() === 'x') {
										arr_idCard[17] = '10' //将最后位为x的验证码替换为10方便后续操作
									}
									for (var i = 0; i < 17; i++) {
										sum += config.wi[i] * arr_idCard[i] //加权求和
									}
									var valCodePosition = sum % 11 //得到验证码所位置
									if (arr_idCard[17] === config.valideCode[valCodePosition]) { //判断身份证号最后的验证位是否正确
										return true
									} else {
										return false
									}
								} else {
									return false
								}
							}
						} else {
							return false
						}
					} else {
						return false
					}
				},
				/**
				 * 日期校验，校验日期必须大于等于关联日期
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validdateafter: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var target = $el.attr('data-validdateafter')
					if (target && $(target).val())
						return Date.parse(value) >= Date.parse($(target).val().trim())
					return false;
				},
				/**
				 * 日期校验，校验日期必须小于等于关联日期
				 * @param $el 验证表单元素 jquery对象
				 * @returns 验证结果 {boolean}
				 */
				validdatebefore: function($el) {
					var value = $el.val().trim()
					if (!value) {
						return true
					}
					var target = $el.attr('data-validdatebefore')
					if (target && $(target).val())
						return Date.parse(value) <= Date.parse($(target).val().trim())
					return false;
				}

			},
			/**
			 * 将表单序列化成json对象
			 * @param form 表单
			 * @returns 列化之后的json对象
			 */
			serializeJson: function(form) {
				var serializeObj = {}
				var array = $(form).serializeArray()
				var str = $(form).serialize()
				$(array).each(function() {
					if (serializeObj[this.name]) {
						if ($.isArray(serializeObj[this.name])) {
							serializeObj[this.name].push(this.value)
						} else {
							serializeObj[this.name] = [serializeObj[this.name], this.value]
						}
					} else {
						serializeObj[this.name] = this.value
					}
				})
				return serializeObj
			}
		},
		/**
		 * 导航栏操作实用工具
		 */
		nav: {
			/**
			 * 导航栏手动触发页面跳转
			 * @param pageName 页面名称
			 * @param querystring 参数
			 */
			dispatch: function(pageName, querystring) {
				$('#sidebarMenu').find('a').each(function(index, item) {
					if ($(item).attr('data-gh-route') === pageName) {
						$(item).click()
						location.hash = '#' + pageName + '?' + querystring
					}
				})
			},
			/**
			 * 获取hash中的参数，转成json object
			 * @param hash
			 * @returns json object
			 */
			getHashObj: function(hash) {
				var querystring = hash.substr(hash.indexOf('?') + 1)
				var obj = {}
				querystring.split('&').forEach(function(item) {
					var arr = item.split('=')
					obj[arr[0]] = arr[1]
				})
				return obj
			}
		},
		/**
		 * 将对象转换成带参数的形式 &a=1&b=2
		 */
		buildQueryUrl: function(url, param) {
			var x = url
			var ba = true
			if (x.indexOf('?') != -1) {
				if (x.indexOf('?') == url.length - 1) {
					ba = false
				} else {
					ba = true
				}
			} else {
				x = x + '?'
				ba = false
			}
			var builder = ''
			for (var i in param) {
				var p = '&' + i + '='
				if (param[i]) {
					var v = param[i]
					if (Object.prototype.toString.call(v) === '[object Array]') {
						for (var j = 0; j < v.length; j++) {
							builder = builder + p + encodeURIComponent(v[j])
						}
					} else if (typeof(v) == "object" && Object.prototype.toString.call(v).toLowerCase() == "[object object]" && !v.length) {
						builder = builder + p + encodeURIComponent(JSON.stringify(v))
					} else {
						builder = builder + p + encodeURIComponent(v)
					}
				}
			}
			if (!ba) {
				builder = builder.substring(1)
			}
			return x + builder
		},
		/**
		 * 生成随机字符串
		 * @param {Object} len 多少位
		 */
		getRandomString: function(len) {
			len = len || 32;
			var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1  
			var maxPos = $chars.length;
			var pwd = '';
			for (i = 0; i < len; i++) {
				pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		},
		/**
		 * 获取风险等级配置值信息存到config中，并首次全局初始化
		 * @param {Object} data 数据
		 */
		initWarrantyLevelOptions: function(data) {
			if (!data) {
				/**
				 * 获取风险等级配置值信息存到config中，并首次全局初始化
				 */
				http.post(config.api.system.config.ccp.warrantyLevel.search, {
					contentType: 'form'
				}, function(data) {
					if (data)
						config.warrantyLevelOptions = data;
				})
			} else {
				config.warrantyLevelOptions = data;
			}
		},
		/**
		 * 安全浮点数计算（不会出现浮点数显示错误）
		 * @param num1 计算数1 number
		 * @param sign 运算符 string
		 * @param num2 计算数2 number
		 * @param fixed 精确到小数点后的位数，会对最后一位进行四舍五入
		 */
		safeCalc: function(num1, sign, num2, fixed) {
			num1 = num1 || 0
			num2 = num2 || 0
			var num1Str = num1 + ''
			var num2Str = num2 + ''
			var num1DecimalPart = num1Str.indexOf('.') >= 0 ? num1Str.substr(num1Str.indexOf('.') + 1).length : 0
			var num2DecimalPart = num2Str.indexOf('.') >= 0 ? num2Str.substr(num2Str.indexOf('.') + 1).length : 0
			var intBase = Math.max(num1DecimalPart, num2DecimalPart)

			num1 = Math.round(num1 * Math.pow(10, intBase))
			num2 = Math.round(num2 * Math.pow(10, intBase))

			var result = 0

			switch (sign) {
				case '+':
					result = (num1 + num2) / Math.pow(10, intBase)
					break
				case '-':
					result = (num1 - num2) / Math.pow(10, intBase)
					break
				case '*':
					result = (num1 * num2) / Math.pow(10, intBase * 2)
					break
				case '/':
					result = num1 / num2
					break
			}

			if (result) {
				if (fixed !== undefined) {
					result = Math.round(result * Math.pow(10, fixed))
					result = result / Math.pow(10, fixed)
				}
				return result
			} else {
				return 0
			}
		},
		/**
		 * 截取文件后缀名
		 * @param {Object} filename
		 */
		getSuffixName: function(filename) {
			if (!filename) {
				alert("文件为空!");
				return false;
			}
			var idx = filename.lastIndexOf(".");
			var filenameLen = filename.length;
			var postf = filename.substring(idx, filenameLen); //后缀名  
			return postf;
		},
		/**
		 * 获取文件名称
		 * @param {Object} filename
		 */
		getfileName: function(filename) {
			if (!filename) {
				alert("文件为空!");
				return false;
			}
			var idx = filename.lastIndexOf("\\");
			var filenameLen = filename.length;
			var postf = filename.substring(idx + 1, filenameLen); //后缀名  
			return postf;
		},
		/*
		copyToClipboard: function(txt) {
			if (window.clipboardData) {
				window.clipboardData.clearData();
				window.clipboardData.setData("Text", txt);
				// alert("已经成功复制到剪帖板上！");
				return true;
			} else if (navigator.userAgent.indexOf("Opera") != -1) {
				window.location = txt;
				return true;
			} else if (window.netscape) {
				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				} catch (e) {
					//alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
					return false;
				}
				var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
				if (!clip) return;
				var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
				if (!trans) return;
				trans.addDataFlavor('text/unicode');
				var str = new Object();
				var len = new Object();
				var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				var copytext = txt;
				str.data = copytext;
				trans.setTransferData("text/unicode", str, copytext.length * 2);
				var clipid = Components.interfaces.nsIClipboard;
				if (!clip) return false;
				clip.setData(trans, null, clipid.kGlobalClipboard);
				return true;
			}
			return false;
		},
		*/
		/**
		 * 将表格生成Excel（office有效；mac系统预览有效，打开乱码）
		 * 使用方法 util.tableToExcel(tableId, tableNameString)
		 * @param tableId table的ID string
		 * @param tableNameString 生成的Excel里sheet的名称 string
		 */
		tableToExcel: (function() {
			var uri = 'data:application/vnd.ms-excel;base64,',
				template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
				base64 = function(s) {
					return window.btoa(unescape(encodeURIComponent(s)))
				},
				format = function(s, c) {
					return s.replace(/{(\w+)}/g, function(m, p) {
						return c[p];
					})
				}
			return function(table, name) {
				if (!table.nodeType) table = document.getElementById(table)
				var ctx = {
					worksheet: name || 'Worksheet',
					table: table.innerHTML
				}
				window.location.href = uri + base64(format(template, ctx))
			}
		})(),
		formatNum: function() {
			var arr = {
				"currency": 2,
				"currency0": 0,
				"currency1": 1,
				"currency6": 6,
				"quantity": 0,
				"decimal0": 0,
				"decimal1": 1,
				"decimal2": 2,
				"decimal3": 3,
				"decimal4": 4,
				"decimal5": 5,
				"decimal6": 6
			}
			$("table").off().on(
				"post-body.bs.table",
				function() {
					$.each(arr, function(e, i) {
						$("div." + e + ",span." + e + ",td." + e).each(function() {
							var _this = $(this);
							if (_this.text() && isNaN(_this.text())) {
								return;
							}
							_this.text($.number(_this.text(), i));
						});
					});
				}
			)
			$.each(arr, function(e) {
				$("div." + e + ",span." + e + ",td." + e).off().on("DOMNodeInserted", function() {
					var _this = $(this);
					_this.attr("old", _this.text());
					var i = 2;
					$.each(arr, function(k, v) {
						if (_this.hasClass(k)) {
							i = v;
						}
					});
					if (_this.text() && isNaN(_this.text()) || $.number(_this.text(), i) === _this.attr("old")) {
						return;
					}
					_this.text($.number(_this.text(), i));
				});
			});

		},
		tryOut: function() {
			if (localStorage.getItem('resources') && localStorage.getItem('resources') === 'HOMEPAGE') {
				$.fn.extend({
					ajaxSubmit: function(options) {
						toastr.error('您正在使用的是试用账号，无法操作此功能，如需操作，请购买正式版。', '错误信息', {
							timeOut: 3600000
						})
						return;
					}
				});
			}
		}
	}
})
