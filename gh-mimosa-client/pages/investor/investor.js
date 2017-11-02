/**
 * 审核列表
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'investor',
		init: function() {

			// 产品列表
			/*http.post(config.api.duration.assetPool.getNameList, function(json) {
					var productOptions = ''
					var select = document.searchForm.productOid
					json.rows.forEach(function(item) {
						productOptions += '<option value="' + item.oid + '">' + item.name + '</option>'
					})
					$(select).html(productOptions)
				})*/
			// 分页配置
			var pageOptions = {
				page: 1,
				rows: 10
			};
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.invest.manager.accountList, {
						data: pageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
						if(config.customerButtonIsOpen=='true'){
							$('#generateFile').show()
						}else{
							$('#generateFile').hide()
						}
					})
				},
				pageNumber: pageOptions.page,
				pageSize: pageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				onLoadSuccess: function() {},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'phoneNum':
							qryInfo(value,row)
							break
						case 'productName' : 
							proQryInfo(value,row)
							break
					}
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return (pageOptions.page - 1) * pageOptions.rows + index + 1
					}
				}, { // 标识
					field: 'phoneNum',
					class:"table_title_detail"
				}, {
					field: 'productCode'
				}, {
					field: 'productName',
					class:"table_title_detail"
				}, {
					field: 'expAror'
				}, {
					field: 'totalVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'toConfirmRedeemVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'toConfirmInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'totalInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'accruableHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'redeemableHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'lockRedeemHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'value',
					class: 'currency',
					align: 'right'
				}, {
					field: 'expGoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdTotalIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalBaseIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalRewardIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'totalCouponIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'holdYesterdayIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayBaseIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayRewardIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'yesterdayCouponIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'confirmDate',
					align: 'right'
				}, {
					field: 'expectIncome',
					class: 'currency',
					align: 'right'
				}, {
					field: 'accountTypeDisp'
				}, {
					field: 'dayRedeemVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'dayInvestVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'dayRedeemCount',
					class: 'quantity',
					align: 'right'
				}, {
					field: 'maxHoldVolume',
					class: 'decimal2',
					align: 'right'
				}, {
					field: 'holdStatusDisp'
				}, {
					field: 'latestOrderTime',
					align: 'right'
				}, {
					field: 'productAlias'
				}]
			};
			
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

			// 初始化数据表格
			$('#dataTable').bootstrapTable(tableConfig);
			// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#dataTable'));
			$$.searchInit($('#orderForm'), $('#orderTable'))
			$$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));
			
			/**
			 * 详情附件表格配置
			 */
			var productDetailInvestFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailInvestFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl+'?realname='+row.name
						}
					}
				}]
			}

			/**
			 * 详情投资协议书表格初始化
			 */
			$('#productDetailInvestFileTable').bootstrapTable(productDetailInvestFileTableConfig)
			
			/**
			 * 详情信息服务协议表格配置
			 */
			var productDetailServiceFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailServiceFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl+'?realname='+row.name
						}
					}
				}]
			}

			/**
			 * 详情信息服务协议表格初始化
			 */
			$('#productDetailServiceFileTable').bootstrapTable(productDetailServiceFileTableConfig)
			
			/**
			 * 详情附件表格配置
			 */
			var productDetailFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
						align: 'right',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl+'?realname='+row.name
						}
					}
				}]
			}

			/**
			 * 详情附件表格初始化
			 */
			$('#productDetailFileTable').bootstrapTable(productDetailFileTableConfig)
			
			/**
			 * 产品详情设置奖励收益表格配置
			 */
			var productRewardTableConfig = {
				columns: [{
					field: 'level'
				}, {
					field: 'startDate',
					formatter: function(val, row, index) {console.log(row)
						if (row.endDate != null && row.endDate != "") {
							return row.startDate + "-" + row.endDate;
						} else {
							return "大于等于" + row.startDate;
						}

					}
				}, {
					field: 'ratio'
				}, ]
			}

			/**
			 * 设置奖励收益表格初始化
			 */
			$('#productRewardTable').bootstrapTable(productRewardTableConfig)

			function getQueryParams(val) {
				var form = document.searchForm;
				$.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象

				pageOptions.rows = val.limit;
				pageOptions.page = parseInt(val.offset / val.limit) + 1

				return val;
			}
			
			function qryInfo (value,row) {
				if(row.accountType === 'INVESTOR'){
					// 初始化订单明细
					var orderPageOptions = {
						page: 1,
						rows: 10,
						offset: 0,
						orderType: '',
						orderStatus: '',
						orderCode: '',
						createTimeBegin: '',
						createTimeEnd: '',
						investorOid: '',
						productOid: ''
					};

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
							var form = document.orderForm
							orderPageOptions.rows = val.limit;
							orderPageOptions.page = parseInt(val.offset / val.limit) + 1;
							orderPageOptions.offset = val.offset
							orderPageOptions.investorOid = row.investorOid;
							orderPageOptions.productOid = row.productOid;
							orderPageOptions.orderType = form.orderType.value
							orderPageOptions.orderStatus = form.orderStatus.value
							orderPageOptions.orderCode = form.orderCode.value
							orderPageOptions.createTimeBegin = form.createTimeBegin.value
							orderPageOptions.createTimeEnd = form.createTimeEnd.value
							return val;
						},
						columns: [
							{
								halign: 'left',
								align: 'center',
								width: 30,
								formatter: function (val, row, index) {
									return index + 1 + orderPageOptions.offset
								}
							},
							{
								field: 'orderCode'
							},
							{
								field: 'orderAmount',
								class: 'currency'
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
								class: 'currency'
							},
							{
								field: 'orderTypeDisp'
							},
							{
								field: 'orderStatusDisp'
							},
							{
								field: 'productName'
							},
							{
								field: 'createTime',
								formatter: function (val) {
									return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
								}
							},
							{
								field: 'createManDisp'
							},
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
					};
					$('#orderTable').bootstrapTable('destroy');
					$('#orderTable').bootstrapTable(orderTableConfig);

					$('#investorDetailModal').modal('show');
				}else if(row.accountType === 'SPV'){
					// 初始化当前持仓明细
					var spvTablePageOptions = {
						page: 1,
						rows: 10,
						productOid: '',
						spvOid: ''
					};
					var spvTableConfig = {
						ajax: function(origin) {
							http.post(config.api.product.spv.getProductSpvSpvOrderlist, {
									data: spvTablePageOptions,
									contentType: 'form'
								},
								function(rlt) {
									origin.success(rlt)
								})
						},
						pageNumber: spvTablePageOptions.page,
						pageSize: spvTablePageOptions.rows,
						pagination: true,
						sidePagination: 'server',
						pageList: [10, 20, 30, 50, 100],
						queryParams: function(val) {
							spvTablePageOptions.rows = val.limit;
							spvTablePageOptions.page = parseInt(val.offset / val.limit) + 1;
							spvTablePageOptions.productOid = row.productOid;
							spvTablePageOptions.spvOid = row.investorOid;
							return val;
						},
						columns: [{ // 订单号
							field: 'orderCode',
						}, { // 资产名称
							field: 'assetPoolName',
						}, { // 交易类型
							field: 'orderType',
							formatter: function(val) {
								switch (val) {
									case 'INVEST':
										return '申购'
									case 'REDEEM':
										return '赎回'
									case 'BUY_IN':
										return '买入'
									case 'PART_SELL_OUT':
										return '部分卖出'
									case 'FULL_SELL_OUT':
										return '全部卖出'
								}
							}
						}, { // 订单类型
							field: 'orderCate',
							formatter: function(val) {
								switch (val) {
									case 'TRADE':
										return '交易订单'
									case 'STRIKE':
										return '冲账订单'
								}
							}
						}, { // 订单金额
							field: 'orderAmount',
							class: 'currency'
						}, { // 订单日期
							field: 'orderDate',
						}, { // 订单状态
							field: 'orderStatus',
							formatter: function(val) {
								switch (val) {
									case 'SUBMIT':
										return '未确认'
									case 'CONFIRM':
										return '确认'
									case 'DISABLE':
										return '失效'
									case 'CALCING':
										return '清算中'
								}
							}
						}]
					};
					$('#spvDetailTable').bootstrapTable('destroy');
					$('#spvDetailTable').bootstrapTable(spvTableConfig);

					$('#spvDetailModal').modal('show');
				}
			}
			
			//文件生成--投资人收益明细
			$("#generateFile").on("click", function(){
				var confirm = $('#confirmModal');
				//通过
				confirm.find('.popover-title').html('提示');
				var html="确定生成持有人手册文件？"
				confirm.find('p').html(html);
				$$.confirm({
					container: confirm,
					trigger: this,
					accept: function() {
						http.post(config.api.generateHoldFile, {
							data: {
								'jobId':'hold'
							},
							contentType: 'form',
						}, function(result) {
							refresh();
						})
					}
				})
			})
			
			function proQryInfo(value,row){
				http.post(config.api.productDetail, {
					data: {
						oid: row.productOid
					},
					contentType: 'form'
				}, function(result) {
					if (result.errorCode == 0) {
						var data = result;

						switch (data.typeOid) {
							case 'PRODUCTTYPE_01':
								$('#detailProductType01Area').show()
								$('#detailProductType02Area').hide()
								$('#rewardDetail').hide()
								break
							case 'PRODUCTTYPE_02':
								$('#detailProductType02Area').show()
								$('#detailProductType01Area').hide()
								$('#rewardDetail').show()
								break
						}

						var productDetailInvestFiles = []
						if (data.investFiles != null && data.investFiles.length > 0) {
							for (var i = 0; i < data.investFiles.length; i++) {
								productDetailInvestFiles.push(data.investFiles[i])
							}
						}
						$('#productDetailInvestFileTable').bootstrapTable('load', productDetailInvestFiles)

						var productDetailServiceFiles = []
						if (data.serviceFiles != null && data.serviceFiles.length > 0) {
							for (var i = 0; i < data.serviceFiles.length; i++) {
								productDetailServiceFiles.push(data.serviceFiles[i])
							}
						}
						$('#productDetailServiceFileTable').bootstrapTable('load', productDetailServiceFiles)

						var productDetailFiles = []
						if (data.files != null && data.files.length > 0) {
							for (var i = 0; i < data.files.length; i++) {
								productDetailFiles.push(data.files[i])
							}
						}
						$('#productDetailFileTable').bootstrapTable('load', productDetailFiles)

						var productRewards = []
						if (data.rewards != null && data.rewards.length > 0) {
							for (var i = 0; i < data.rewards.length; i++) {
								productRewards.push(data.rewards[i])
							}
						}
						$('#productRewardTable').bootstrapTable('load', productRewards)
						
						data.expandProductLabels=''
						if(data.expandProductLabelNames != null && data.expandProductLabelNames.length > 0) {
							for(var i = 0; i < data.expandProductLabelNames.length; i++) {
								data.expandProductLabels+=data.expandProductLabelNames[i]+"&nbsp;&nbsp;&nbsp;"
							}
						}

						$$.detailAutoFix($('#productDetailModal'), data); // 自动填充详情
						$('#productDetailModal').modal('show');
					} else {
						alert(查询失败);
					}
				})
			
			}
		}
	}
});