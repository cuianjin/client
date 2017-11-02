/**
 * 发行人账户管理详情
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'c_accountdetail',
		init: function(){
			var publisherOid = util.nav.getHashObj(location.hash).publisherOid || '';
			http.post(config.api.publisherSuserinfo, {
				data: {
					publisherOid: publisherOid
				},
				contentType: 'form'
			}, function (result) {
				$('#basicBalance').html(result.basicBalance || '--')
				$('#totalLoanAmount').html(result.totalLoanAmount)
				$('#totalDepositAmount').html(result.totalDepositAmount)
				$('#totalWithdrawAmount').html(result.totalWithdrawAmount)
				$('#totalInterestAmount').html(result.totalInterestAmount)
				$('#overdueTimes').html(result.overdueTimes)
				
				$("#phone").html(result.phone)
				$("#createTime").html(result.createTime)
				$("#realName").html(result.realName || '--')
				$("#certificateNo").html(result.certificateNo || '--')
				$("#bankName").html(result.bankName || '--')
				$("#cardNo").html(result.cardNo || '--')
				$("#statusDisp").html(result.statusDisp)
				$("#collectionSettlementBalance").html(result.collectionSettlementBalance)
				$("#availableAmountBalance").html(result.availableAmountBalance)
				$("#frozenAmountBalance").html(result.frozenAmountBalance)
				$("#withdrawAvailableAmountBalance").html(result.withdrawAvailableAmountBalance)
			})
			var pageOptions1 = {
				number: 1,
				size: 10,
				offset: 0,
				code: '',
				name: '',
				creTimeBegin: '',
				creTimeEnd: ''
			}
			var pageOptions2 = {
				number: 1,
				size: 10,
				offset: 0,
				orderType: '',
				orderStatus: ''
			}
	    
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(config.api.caccountAccproducts, {
						data: {
							page: pageOptions1.number,
							rows: pageOptions1.size,
							code: pageOptions1.code,
							name: pageOptions1.name,
							publisherBaseAccountOid: publisherOid,
							creTimeBegin: pageOptions1.creTimeBegin,
							creTimeEnd: pageOptions1.creTimeEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions1.number,
				pageSize: pageOptions1.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams1,
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'name':
							qryInfo(value,row)
							break
					}
				},
				columns: [
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions1.offset
						}
					},
					{
						field: 'code'
					},
					{
						field: 'name',
						class:"table_title_detail"
					},
					{
						field: 'typeName'
					},
					{
						field: 'administrator'
					},
					{
						field: 'createTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					}
				]
			}
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.publisherSmng, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							publisherOid: publisherOid,
							orderType: pageOptions2.orderType,
							orderStatus: pageOptions2.orderStatus
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions2.number,
				pageSize: pageOptions2.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams2,
				columns: [
					{
						halign: 'center',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions2.offset
						}
					},
					{
						field: 'orderCode',
						align: 'right'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'feePayerDisp',
						align: 'right',
						formatter: function (val) {
							return val || '--'
						}
					},
					{
						field: 'fee',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'orderAmount',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'orderStatusDisp'
					},
					{
						field: 'orderTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'completeTime',
						align: 'right',
						formatter: function (val) {
							return val ? util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss') : '--'
						}
					},
					{
						align: 'center',
						formatter: function (val, row,index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								sub:[{
									text: '冲正',
									type: 'button',
									class: 'item-positive',
									isRender: row.orderType === "deposit" && row.orderStatus === "payFailed"
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable2');
						},
						events: {
							'click .item-positive': function (e, value, row) {
								$('#confirmModal').find('p').html('确定进行冲正？')
								$$.confirm({
									container: $('#confirmModal'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.publisherCright, {
											orderCode: row.orderCode
										}), {
											contentType: 'application/json',
										}, function (result) {
											$('#dataTable2').bootstrapTable('refresh')
										})
									}
								})
							}
						}
					}
				]
			}
			
			$('#dataTable1').bootstrapTable(tableConfig1)
			$('#dataTable2').bootstrapTable(tableConfig2)
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			
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
					formatter: function(val, row, index) {
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
			
			$("#doExport").on("click",function(){
				util.tableToExcel($("#dataTable2")[0],"平台余额流水")
			})
			
			function getQueryParams1 (val) {
				var form = document.searchForm1
				pageOptions1.size = val.limit
				pageOptions1.number = parseInt(val.offset / val.limit) + 1
				pageOptions1.offset = val.offset
				pageOptions1.code = form.code.value
				pageOptions1.name = form.name.value
				pageOptions1.creTimeBegin = form.creTimeBegin.value
				pageOptions1.creTimeEnd = form.creTimeEnd.value
				return val
			}
			
			function getQueryParams2 (val) {
				var form = document.searchForm2
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				pageOptions2.offset = val.offset
				pageOptions2.orderType = form.orderType.value
				pageOptions2.orderStatus = form.orderStatus.value
				return val
			}
			
			$(".check_img").on("click",function(){
				if(this === document.getElementById('website')){
					return
				}
				var _url = $(this).attr("data-url");
				$("#Modal_img").attr("src",_url);
				$("#eventModal1").modal("show");
			});
			
			$(".check_original_img").on("click",function(){
				var _url = $("#Modal_img").attr("src");
				window.open(_url);
			});
			
			function qryInfo(value,row){
				http.post(config.api.productDetail, {
					data: {
						oid: row.oid
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
})
