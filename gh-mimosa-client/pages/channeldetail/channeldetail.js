// 载入所需模块
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'channeldetail',
			init: function() {

				var channelInfo = {
					oid: ''
				}

				// 记录正在操作的单条待录入产品
				var opRow = null

				http.post(config.api.oneChannel, function(result) {
					channelInfo.oid = result.oid
					$$.detailAutoFix($('#detailForm'), result); // 自动填充详情
					if (result.channelStatus == 'off' && result.deleteStatus == 'no') {
						$('#editChanBut').show();
					} else {
						$('#editChanBut').hide();
					}
					// 初始化数据表格
					$('#productTable').bootstrapTable(productTableConfig);
					$('#orderTable').bootstrapTable(orderTableConfig);
					$('#channelTable').bootstrapTable(channelTableConfig);
					
					var form = document.productSearchForm
					var productStateSelect = $(form.productState).empty()
					
					productStateSelect.append('<option value="NOTSTARTRAISE;RAISING;RAISEEND;RAISEFAIL;NOTSTARTDURATION;DURATIONING;DURATIONEND;CLEARING;CLEARED">全部</option>')
					productStateSelect.append('<option value="NOTSTARTRAISE">未开始募集</option>')
					productStateSelect.append('<option value="RAISING">募集中</option>')
					productStateSelect.append('<option value="RAISEEND">募集结束</option>')
					productStateSelect.append('<option value="RAISEFAIL">募集失败</option>')
					productStateSelect.append('<option value="NOTSTARTDURATION">存续期未开始</option>')
					productStateSelect.append('<option value="DURATIONING">存续期</option>')
					productStateSelect.append('<option value="DURATIONEND">存续期结束</option>')
					productStateSelect.append('<option value="CLEARING">清算中</option>')
					productStateSelect.append('<option value="CLEARED">已清算</option>')
									
				})
				
				/**
			 * 募集开始时间&成立时间select联动 
			 */
			$('select[name=productType]').on('change', function() {
				var col = $(this).parent().parent()
	
				if(this.value==='PRODUCTTYPE_02') {
					var form = document.productSearchForm
					var productStateSelect = $(form.productState).empty()
					productStateSelect.append('<option value="NOTSTARTDURATION;DURATIONING;DURATIONEND;CLEARING;CLEARED">全部</option>')
					productStateSelect.append('<option value="NOTSTARTDURATION">存续期未开始</option>')
					productStateSelect.append('<option value="DURATIONING">存续期</option>')
					productStateSelect.append('<option value="DURATIONEND">存续期结束</option>')
					productStateSelect.append('<option value="CLEARING">清算中</option>')
					productStateSelect.append('<option value="CLEARED">已清算</option>')
				} else if(this.value==='PRODUCTTYPE_01') {
					var form = document.productSearchForm
					var productStateSelect = $(form.productState).empty()
					productStateSelect.append('<option value="NOTSTARTRAISE;RAISING;RAISEEND;RAISEFAIL;DURATIONING;DURATIONEND;CLEARING;CLEARED">全部</option>')
					productStateSelect.append('<option value="NOTSTARTRAISE">未开始募集</option>')
					productStateSelect.append('<option value="RAISING">募集中</option>')
					productStateSelect.append('<option value="RAISEEND">募集结束</option>')
					productStateSelect.append('<option value="RAISEFAIL">募集失败</option>')
					productStateSelect.append('<option value="DURATIONING">存续期</option>')
					productStateSelect.append('<option value="DURATIONEND">存续期结束</option>')
					productStateSelect.append('<option value="CLEARING">清算中</option>')
					productStateSelect.append('<option value="CLEARED">已清算</option>')
				} else {
					var form = document.productSearchForm
					var productStateSelect = $(form.productState).empty()
					productStateSelect.append('<option value="NOTSTARTRAISE;RAISING;RAISEEND;RAISEFAIL;NOTSTARTDURATION;DURATIONING;DURATIONEND;CLEARING;CLEARED">全部</option>')
					productStateSelect.append('<option value="NOTSTARTRAISE">未开始募集</option>')
					productStateSelect.append('<option value="RAISING">募集中</option>')
					productStateSelect.append('<option value="RAISEEND">募集结束</option>')
					productStateSelect.append('<option value="RAISEFAIL">募集失败</option>')
					productStateSelect.append('<option value="NOTSTARTDURATION">存续期未开始</option>')
					productStateSelect.append('<option value="DURATIONING">存续期</option>')
					productStateSelect.append('<option value="DURATIONEND">存续期结束</option>')
					productStateSelect.append('<option value="CLEARING">清算中</option>')
					productStateSelect.append('<option value="CLEARED">已清算</option>')
				}

			}).change()

				var productPageOptions = {
					page: 1,
					rows: 10,
					channelOid: channelInfo.oid,
					productName: '',
					productCode: '',
					productState: '',
					productType: '',
					marketState: ''
				}

				// product数据表格配置
				var productTableConfig = {
					ajax: function(origin) {
						http.post(config.api.channelDetail.product, {
							data: productPageOptions,
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					},
					pageNumber: productPageOptions.page,
					pageSize: productPageOptions.rows,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: function(val) {
						var form = document.productSearchForm
						$.extend(productPageOptions, util.form.serializeJson(form));
						productPageOptions.rows = val.limit
						productPageOptions.page = parseInt(val.offset / val.limit) + 1
						productPageOptions.offset = val.offset
						productPageOptions.channelOid = channelInfo.oid
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return productPageOptions.offset + index + 1
						}
					}, {
						field: 'cid',
						align: 'right'
					}, {
						field: 'ckey'
					}, {
						field: 'channelName'
					}, {
						field: 'productName'
					}, {
						field: 'productCode'
					}, {
						field: 'productTypeName'
					}, {
						field: 'productStatus',
						formatter: function(val, row, index) {
							switch (val) {
								case 'NOTSTARTRAISE':
									return '<span class="text-red">未开始募集</span>'
								case 'RAISING':
									return '<span class="text-blue">募集中</span>'
								case 'RAISEEND':
									return '<span class="text-orange">募集结束</span>'
								case 'RAISEFAIL':
									return '<span class="text-gray">募集失败</span>'
								case 'NOTSTARTDURATION':	
									return '<span class="text-red">存续期未开始</span>'
								case 'DURATIONING':
									return '<span class="text-blue">存续期</span>'
								case 'DURATIONEND':
									return '<span class="text-orange">存续期结束</span>'
								case 'CLEARING':
									return '<span class="text-yellow">清算中</span>'
								case 'CLEARED':
									return '<span class="text-green">已清算</span>'
								default:
									return '-'
							}
						}
					}, {
						field: 'marketState',
						formatter: function(val) {
							switch (val) {
								case 'NOSHELF':
									return '<span class="text-green">待上架</span>'
								case 'SHELFING':
									return '<span class="text-red">上架中</span>'
								case 'ONSHELF':
									return '<span class="text-blue">已上架</span>'
								case 'OFFSHELF':
									return '<span class="text-yellow">已下架</span>'	
							}
						}
					}, {
						field: 'rackTime',
						align: 'right'
					}, {
						field: 'downTime',
						align: 'right'
					}, {
						align: 'center',
						formatter: function(val, row, index) {
//							var buttons = [{
//								text: '上架',
//								type: 'button',
//								class: 'item-upshelf',
//								isRender: row.marketState == 'NOSHELF' || row.marketState == 'OFFSHELF'
//							}, {
//								text: '下架',
//								type: 'button',
//								class: 'item-downshelf',
//								isRender: row.marketState == 'ONSHELF'
//							}, {
//								text: '费用明细',
//								type: 'button',
//								class: 'item-detail'
//							}, {
//								text: '录入费用',
//								type: 'button',
//								class: 'item-input'
//							}]
							
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#productTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '上架',
									type: 'button',
									class: 'item-upshelf',
									isRender: row.marketState == 'NOSHELF' || row.marketState == 'OFFSHELF'
								}, {
									text: '下架',
									type: 'button',
									class: 'item-downshelf',
									isRender: row.marketState == 'ONSHELF'
								}, 
//								{
//									text: '费用明细',
//									type: 'button',
//									class: 'item-detail'
//								}, {
//									text: '录入费用',
//									type: 'button',
//									class: 'item-input'
//								}
								]
							}]
							return util.table.formatter.generateButton(buttons, 'productTable');
						},
						events: {
							'click .item-upshelf':function(e, value, row){
								$('#confirmModal').find('.popover-title').html('产品上架操作')
								$('#confirmModal').find('p').html('请确认进行上架操作?');
								$$.confirm({
									container: $('#confirmModal'),
									trigger: this,
									accept: function () {
										http.post(config.api.productChannelUpshelf,{
											data:{
												oid:row.oid			
											},
											contentType: 'form'
						        		}, function(res){			 
//						        			$('#confirmModal').modal('hide')
						        			$('#productTable').bootstrapTable('refresh')
						        			
						        			if ($("#spvLackOfPositionMessage").children().length > 0) {
						        				$("#spvLackOfPositionMessage").children().remove()
						        			}	
						        			var h5 = $('<h5>'+res.errorMessage+'</h5>')
						        			$("#spvLackOfPositionMessage").append(h5)
						        			$('#spvLackOfPositionModal').modal('show')
						        		})	
									}
								})
							},
							'click .item-downshelf':function(e, value, row){
								$('#confirmModal').find('.popover-title').html('产品下架操作')
								$('#confirmModal').find('p').html('请确认进行下架操作?');
								$$.confirm({
									container: $('#confirmModal'),
									trigger: this,
									accept: function () {
										http.post(config.api.productChannelOffshelf,{
											data:{
												oid:row.oid		
											},
											contentType: 'form'	
										}, function(res){	
//											$('#confirmModal').modal('hide')
											$('#productTable').bootstrapTable('refresh')
										})		
									}
								})
							},	
							'click .item-input': function(e, value, row) {
								opRow = row
								var form = document.inputForm
								util.form.reset($(form))
								$$.formAutoFix($(form), row)
								http.get(config.api.gacha.findSPVAndCustomer, function(rlt) {
									var getspv = $(form.getspv).empty()
									rlt.spvlist.forEach(function(item) {
										getspv.append('<option value="' + item.oid + '">' + item.name + '</option>')
									})
									getspv.off().on('change', function() {
										var val = this.value
										rlt.spvlist.forEach(function(item) {
											if (item.oid === val) {
												$(form.accountType).val(item.accountType)
												$(form.accountInfo).val(item.accountNo)
												$(form.customerId).val(rlt.customer.customer_id)
												$(form.customerInfo).val(rlt.customer.customer_account)
											}
										})
									}).change()
								})
								$('#inputModal').modal('show')
							},
							'click .item-detail': function(e, value, row) {
								accruedFeeOptions.productOid = payFeeOptions.productOid = row.productOid
								accruedFeeOptions.productName = payFeeOptions.productName = row.productName
								$('#accruedFeeTable').bootstrapTable('destroy')
								$('#payFeeTable').bootstrapTable('destroy')
								$('#accruedFeeTable').bootstrapTable(accruedFeeTableConfig)
								$('#payFeeTable').bootstrapTable(payFeeTableConfig)
								$('#detailModal').modal('show')
							}
						}
					}]
				}

				var orderPageOptions = {
					page: 1,
					rows: 10,
					orderType: '',
					orderStatus: '',
					orderCode: '',
					createTimeBegin: '',
					createTimeEnd: '',
					channelOid: channelInfo.oid,
				}

				// product数据表格配置
				var orderTableConfig = {
					ajax: function(origin) {
						http.post(config.api.gacha.tradeorder, {
							data: orderPageOptions,
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					},
					pageNumber: orderPageOptions.page,
					pageSize: orderPageOptions.rows,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: function(val) {
						var form = document.orderSearchForm
						$.extend(orderPageOptions, util.form.serializeJson(form));
						orderPageOptions.rows = val.limit
						orderPageOptions.page = parseInt(val.offset / val.limit) + 1
						orderPageOptions.offset = val.offset
						orderPageOptions.channelOid = channelInfo.oid
					},
					columns: [
						{
							width: 30,
							align: 'center',
							formatter: function (val, row, index) {
								return index + 1 + orderPageOptions.offset
							}
						},
						{
							field: 'orderCode',
							align: 'right'
						},
						{
							field: 'orderAmount',
							class: 'currency',
							align: 'right'
						},
						{
							field: 'couponTypeDisp',
							align: 'right'
						},
						{
							field: 'couponAmount',
							class: 'currency',
							align: 'right'
						},
						{
							field: 'payAmount',
							class: 'currency',
							align: 'right'
						},
						{
							field: 'orderTypeDisp'
						},
						{
							field: 'orderStatusDisp'
						},
//						{
//							field: 'productCode'
//						},
						{
							field: 'productName'
						},
						{
							field: 'createTime',
							align: 'right',
							formatter: function (val) {
								return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
							}
						},
						{
							field: 'createManDisp'
						},
//						{
//							field: 'investorClearStatusDisp',
//							formatter: function (val) {
//								return val || '--'
//							}
//						},
//						{
//							field: 'investorCloseStatusDisp',
//							formatter: function (val) {
//								return val || '--'
//							}
//						},
						{
							field: 'publisherClearStatusDisp',
							formatter: function (val) {
								return val || '--'
							}
						},
						{
							field: 'publisherConfirmStatusDisp',
							formatter: function (val) {
								return val || '--'
							}
						},
						{
							field: 'publisherCloseStatusDisp',
							formatter: function (val) {
								return val || '--'
							}
						},
						{
							align: 'center',
							width: 200,
							formatter: function (val, row, index) {
								var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#orderTable').bootstrapTable('getData').length - 1,
									sub:[{
										text: '投资协议',
										type: 'button',
										class: 'item-invest',
										isRender: row.investContractAddr
									},{
										text: '服务协议',
										type: 'button',
										class: 'item-service',
										isRender: row.serviceContractAddr
									},{
										text: '支付日志',
										type: 'button',
										class: 'item-logs',
										isRender: row.orderCode
									}]
								}]
								return util.table.formatter.generateButton(buttons, 'orderTable');
							},
							events: {
								'click .item-invest': function (e, value, row) {
									window.open(location.href.substr(0,location.href.indexOf("mimosaui/index.html"))+row.investContractAddr)
								},
								'click .item-service': function (e, value, row) {
									window.open(location.href.substr(0,location.href.indexOf("mimosaui/index.html"))+row.serviceContractAddr)
								},
								'click .item-logs': function (e, value, row) {
									orderLogPageOptions.interfaceName = ''
									orderLogPageOptions.orderCode = row.orderCode
									document.orderLogSearchForm.interfaceName.value = ''
									$('#orderLogDataTable').bootstrapTable('destroy')
									$('#orderLogDataTable').bootstrapTable(orderLogTableConfig)
									$('#orderLogModal').modal('show')
								}
							}
						}
					]
				}
				
				var orderLogPageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					interfaceName: '',
					orderCode: ''
				}
				
				var orderLogTableConfig = {
					ajax: function(origin) {
						http.post(
							config.api.settlementLogmng, {
								data: {
									page: orderLogPageOptions.number,
									rows: orderLogPageOptions.size,
									interfaceName: orderLogPageOptions.interfaceName,
									orderCode: orderLogPageOptions.orderCode
								},
								contentType: 'form'
							},
							function(rlt) {
								origin.success(rlt)
							}
						)
					},
					pageNumber: orderLogPageOptions.number,
					pageSize: orderLogPageOptions.size,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: function(val) {
						var form = document.orderLogSearchForm
						orderLogPageOptions.size = val.limit
						orderLogPageOptions.number = parseInt(val.offset / val.limit) + 1
						orderLogPageOptions.offset = val.offset
						orderLogPageOptions.interfaceName = form.interfaceName.value.trim()
						return val
					},
					onLoadSuccess: function() {},
					onClickCell: function (field, value, row, $element) {
						switch (field) {
							case 'interfaceName':
								$$.detailAutoFix($('#interfaceDetailModal'), row);
								// errorMessage错误有时会包含html标签，影响整体样式显示
								var temp = document.createElement("div");
								temp.innerHTML = row.errorMessage;
								$('#errorMessage').html(temp.innerText);
								$('#interfaceDetailModal').modal('show');
								break
						}
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return index + 1 + orderLogPageOptions.offset
						}
					}, {
						field: 'interfaceName',
						class:"table_title_detail"
					}, {
						field: 'orderCode',
						class: 'align-right'
					}, {
						field: 'ipayNo',
						class: 'align-right'
					}, {
						field: 'handleTypeDisp',
						class: 'align-right'
					}, {
						field: 'errorCode',
						class: 'align-right'
					}, {
						field: 'sendedTimes',
						class: 'align-right'
					}, {
						field: 'limitSendTimes',
						class: 'align-right'
					}, {
						field: 'nextNotifyTime',
						class: 'align-right'
					}, {
						field: 'createTime',
						class: 'align-right'
					}, {
						field: 'updateTime',
						class: 'align-right'
					}]
				}

				// 分页配置
				var channelPageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					channelName: ''
				}

				var channelTableConfig = {
					ajax: function(origin) {
						http.post(config.api.channelQuery, {
							data: {
								page: channelPageOptions.number,
								rows: channelPageOptions.size,
								channelName: channelPageOptions.channelName,
								delStatus: 'no'
							},
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: function(val) {
						channelPageOptions.size = val.limit
						channelPageOptions.number = parseInt(val.offset / val.limit) + 1
						channelPageOptions.offset = val.offset
						channelPageOptions.channelName = $('#searchChannelName').val()
						return val
					},
					columns: [{
							width: 30,
							align: 'center',
							formatter: function(val, row, index) {
								return channelPageOptions.offset + index + 1
							}
						},
						/*{
							field: 'channelId'
						},*/
						{
							field: 'channelName'
						}, {
							align: 'center',
							width: 80,
							formatter: function(val, row, index) {
								var buttons = [{
									text: '选择',
									type: 'button',
									class: 'item-choose'
								}]
								return util.table.formatter.generateButton(buttons, 'channelTable');
							},
							events: {
								'click .item-choose': function(e, value, row) {
									pageInit(row.oid)
									$('#channelsModal').modal('hide')
								}
							}
						}
					]
				}

				// 费用明细-计提明细 查询参数
				var accruedFeeOptions = {
					page: 1,
					rows: 10,
					productOid: '',
					productName: ''
				}

				// 费用明细-计提明细 数据表格配置
				var accruedFeeTableConfig = {
					ajax: function(origin) {
						http.post(config.api.gacha.getAccruedFeeListByOid, {
							data: accruedFeeOptions,
							contentType: 'form'
						}, function(rlt) {
							rlt.rows = rlt.rows.map(function(item) {
								item.productName = accruedFeeOptions.productName
								return item
							})
							origin.success(rlt)
						})
					},
					pageNumber: accruedFeeOptions.page,
					pageSize: accruedFeeOptions.rows,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: function(val) {
						accruedFeeOptions.rows = val.limit
						accruedFeeOptions.page = parseInt(val.offset / val.limit) + 1
						accruedFeeOptions.offset = val.offset
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return orderPageOptions.offset + index + 1
						}
					}, {
						field: 'productName'
					}, {
						field: 'tday',
						align: 'right'
					}, {
						field: 'fee',
						align: 'right'
					}, {
						field: 'feePercent',
						align: 'right',
						formatter: function(val, row, index) {
							return val * 100;
						}
					}]
				}

				// 费用明细-支付明细 查询参数
				var payFeeOptions = {
					page: 1,
					rows: 10,
					productOid: '',
					productName: ''
				}

				// 费用明细-支付明细 数据表格配置
				var payFeeTableConfig = {
					ajax: function(origin) {
						http.post(config.api.gacha.getFeeListByOid, {
							data: payFeeOptions,
							contentType: 'form'
						}, function(rlt) {
							rlt.rows = rlt.rows.map(function(item) {
								item.productName = accruedFeeOptions.productName
								return item
							})
							origin.success(rlt)
						})
					},
					pageNumber: payFeeOptions.page,
					pageSize: payFeeOptions.rows,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: function(val) {
						payFeeOptions.rows = val.limit
						payFeeOptions.page = parseInt(val.offset / val.limit) + 1
						payFeeOptions.offset = val.offset
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return orderPageOptions.offset + index + 1
						}
					}, {
						field: 'productName'
					}, {
						field: 'busDate',
						align: 'right'
					}, {
						field: 'notifyType',
						formatter: function(val) {
							if (val == 'payPlatformFee') {
								return "支付平台费用"
							}
							if (val == 'payPlatformCouFee') {
								return "手续费"
							}
							return ""
						}
					}, {
						field: 'costFee',
						align: 'right'
					}, {
						field: 'notifyStatus',
						formatter: function(val) {
							if (val == 'toConfirm') {
								return "待确认"
							}
							if (val == 'confirmed') {
								return "已确认"
							}
							return ""
						}
					}]
				}

				$$.searchInit($('#productSearchForm'), $('#productTable'));
				$$.searchInit($('#orderSearchForm'), $('#orderTable'));
				$$.searchInit($('#channelSearchForm'), $('#channelTable'));
				$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));

				util.form.validator.init($('#channelForm'))

				$("#editChanBut").on("click", function() {
					http.post(config.api.channelinfo, {
						data: {
							oid: channelInfo.oid
						},
						contentType: 'form',
					}, function(result) {
						$$.formAutoFix($('#channelForm'), result); // 自动填充详情                 
						$('#channelForm').validator('validate')
					})
					$('#channelModal').modal('show');
				});

				//切换渠道
				$("#checkChanBut").on("click", function() {
					$('#searchChannelName').val('');
					channelPageOptions.number = 1;
					channelPageOptions.size = 10;
					channelPageOptions.offset = 0;
					channelPageOptions.channelName = '';
					$('#channelTable').bootstrapTable('refresh');
					$('#channelsModal').modal('show');
				});

				//修改渠道
				$("#channelSubmit").on("click", function() {
					document.channelForm.oid.value = channelInfo.oid
					$('#channelForm').ajaxSubmit({
						url: config.api.editChannel,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#channelModal').modal('hide')
								pageInit(channelInfo.oid)
								$('#channelTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				});

				// 验证初始化
				util.form.validator.init($('#inputForm'))

				// 手续费录入弹窗确定按钮
				$('#doInput').on('click', function() {
					var form = document.inputForm
					if (!$(form).validator('doSubmitCheck')) return
					var formdata = $.extend({}, opRow, util.form.serializeJson(form))
					http.post(config.api.gacha.offsetmoney, {
						data: JSON.stringify({
							offsetMoneyList: [formdata]
						}),
					}, function(result) {
						$('#inputModal').modal('hide')
					})
				})

				function pageInit(oid) {
					http.post(config.api.channelinfo, {
						data: {
							oid: oid
						},
						contentType: 'form',
					}, function(result) {
						channelInfo.oid = result.oid
						$$.detailAutoFix($('#detailForm'), result); // 自动填充详情
						if (result.channelStatus == 'off' && result.deleteStatus == 'no') {
							$('#editChanBut').show();
						} else {
							$('#editChanBut').hide();
						}
						$('#productTable').bootstrapTable('refresh');
						$('#orderTable').bootstrapTable('refresh');
					})
				}

			}
		}
	})