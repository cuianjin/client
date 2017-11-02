/**
 * 复核列表
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'productReview',
		init: function() {
			// js逻辑写在这里
			// 数据表格分页、搜索条件配置
			var pageOptions = {
					number: 1,
					size: 10,
					name: '',
					type: ''
				}
				// 用于存储表格checkbox选中的项
			var checkItems = []
			var selectProductOid
				// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(
							config.api.productCheckList, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									name: pageOptions.name,
									type: pageOptions.type
								},
								contentType: 'form'
							},
							function(rlt) {
								origin.success(rlt)
							}
						)
					},
					pageNumber: pageOptions.number,
					pageSize: pageOptions.size,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getQueryParams,
					onLoadSuccess: function() {},
					onClickCell: function (field, value, row, $element) {
						switch (field) {
							case 'name':
								qryInfo(value,row)
								break
						}
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return (pageOptions.number - 1) * pageOptions.size + index + 1
						}
					}, {
						field: 'code',
					}, {
						field: 'name',
						class:"table_title_detail"
					}, {
						field: 'typeName',
					}, {
						field: 'administrator',
					}, {
						field: 'status',
						formatter: function(val) {
							var className = ''
							switch(val) {
								case 'CREATE':
								return '新建'
							case 'UPDATE':
								return '修改'
							case 'AUDITING':
								className = 'text-blue'
								return '<span class="' + className + '">审核中</span>'
							case 'AUDITFAIL':
								className = 'text-red'
								return '<span class="' + className + '">审核不通过</span>'
							case 'AUDITPASS':
								className = 'text-green'
								return '<span class="' + className + '">审核通过</span>'
							case 'REVIEWFAIL':
								className = 'text-red'
								return '<span class="' + className + '">复核不通过</span>'
							case 'REVIEWPASS':
								className = 'text-green'
								return '<span class="' + className + '">复核通过</span>'
							case 'NOTSTARTRAISE':
								className = 'text-blue'
								return '<span class="' + className + '">未开始募集</span>'
							case 'RAISING':
								className = 'text-red'
								return '<span class="' + className + '">募集开始日期已到</span>'
							case 'RAISEEND':
								className = 'text-red'
								return '<span class="' + className + '">募集结束日期已到</span>'
							case 'NOTSTARTDURATION':
								className = 'text-blue'
								return '<span class="' + className + '">存续期未开始</span>'	
							case 'DURATIONING':
								className = 'text-red'
								return '<span class="' + className + '">存续期开始日期已到</span>'	
							case 'DURATIONEND':
								className = 'text-red'
								return '<span class="' + className + '">存续期结束日期已到</span>'
							default:
								return '-'
							}
						}
					}, {
						field: 'expAror',
						align: 'right',
						formatter: function(val, row, index) {
							if(row.expArorSec != null && row.expAror != row.expArorSec) {
								return row.expAror + "~" + row.expArorSec;
							}
							return row.expAror;
						}
					}, {
						field: 'raisedTotalNumber',
						align: 'right',
						class: 'decimal0',
						formatter: function(val, row, index) {
							var typeOid = row.typeOid;
							if(typeOid == "PRODUCTTYPE_01") {
								return row.raisedTotalNumber;
							} else {
								return "不限";
							}
						}
					}, {
						field: 'assetPoolName',
					}, {
						field: 'applicant',
					}, {
						field: 'applyTime',
						align: 'right',
						formatter: function(val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD')
						}
					}, {
						field: 'auditor',
					}, {
						field: 'auditTime',
						align: 'right',
						formatter: function(val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD')
						}
					}, {
						align: 'center',
						formatter: function(val, row) {
							var buttons = [{
//								text: '批准',
//								type: 'button',
//								class: 'item-approve',
//								isRender: true
//							}, {
//								text: '驳回',
//								type: 'button',
//								class: 'item-reject',
//								isRender: true
//							}, {
								text: '复核',
								type: 'button',
								class: 'item-reject',
								isRender: true
							}];
							return util.table.formatter.generateButton(buttons, 'productReviewTable');
						},
						events: {
							
//							'click .item-approve': function(e, value, row) {
//								selectProductOid = row.oid;
//								$("#oid").val(row.oid)
//								$("#reviewComment").val("")
//								$$.confirm({
//									container: $('#doReviewConfirm'),
//									trigger: this,
//									accept: function() {
//										http.post(config.api.productReviewApprove, {
//											data: {
//												oid: row.oid
//											},
//											contentType: 'form',
//										}, function(result) {
//											$('#productReviewTable').bootstrapTable('refresh')
//										})
//									}
//								})
//							},
//							'click .item-reject': function(e, value, row) {
//								selectProductOid = row.oid;
//								$("#oid").val(row.oid)
//								$("#reviewComment").val("")
//								$$.confirm({
//									container: $('#doReviewConfirm'),
//									trigger: this,
//									accept: function() {
//										var auditComment = $("#reviewComment").val()
//										if(null == auditComment || "" == auditComment) {
//
//										} else {
//											http.post(config.api.productReviewReject, {
//												data: {
//													oid: row.oid,
//													auditComment: auditComment
//												},
//												contentType: 'form',
//											}, function(result) {
//												$('#productReviewTable').bootstrapTable('refresh')
//											})
//										}
//									}
//								})
//							}
							'click .item-reject': function(e, value, row) {
								selectProductOid = row.oid;
								http.post(config.api.productDetail, {
									data: {
										oid: selectProductOid
									},
									contentType: 'form'
								}, function(result) {
									$('#rewiewProductForm').validator('destroy')
									var data = result
									document.rewiewProductForm.auditComment.value = ""
									$$.detailAutoFix($('#rewiewProductForm'), data); // 自动填充详情	
									$$.formAutoFix($('#rewiewProductForm'), data); // 自动填充表单
									util.form.validator.init($('#rewiewProductForm'))
									$('#rewiewProductModal').modal('show')
								})
							
							
							}
							
						}
					}, ]
				}
				// 数据表格初始化
			$('#productReviewTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#productReviewTable'))
			
			/**
    	 * 驳回
    	 */
		$('#rewiewProductSubmit').on('click', function() {
			if (!$('#rewiewProductForm').validator('doSubmitCheck')) return
				
			$('#rewiewProductForm').ajaxSubmit({
				url: config.api.productReviewReject,
				success: function(addResult) {
					$('#rewiewProductModal').modal('hide')
					$('#productReviewTable').bootstrapTable('refresh')
				}
			})
		})
		
		/**
    	 * 批准
    	 */
		$('#approve').on('click', function() {
			$('#rewiewProductForm').ajaxSubmit({
				url: config.api.productReviewApprove,
				success: function(addResult) {
					$('#rewiewProductModal').modal('hide')
					$('#productReviewTable').bootstrapTable('refresh')
				}
			})
		})
		

			// 详情附件表格配置
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
								location.href = row.furl
							}
						}
					}]
				}
				// 详情投资协议书表格初始化
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
							location.href = row.furl
						}
					}
				}]
			}

			/**
			 * 详情信息服务协议表格初始化
			 */
			$('#productDetailServiceFileTable').bootstrapTable(productDetailServiceFileTableConfig)

			// 详情附件表格配置
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
								location.href = row.furl
							}
						}
					}]
				}
				// 详情附件表格初始化
			$('#productDetailFileTable').bootstrapTable(productDetailFileTableConfig)

			// 产品详情设置奖励收益表格配置
			var productRewardTableConfig = {
					columns: [{
						field: 'level',
					}, {
						field: 'startDate',
						formatter: function(val, row, index) {
							if(row.endDate != null && row.endDate != "") {
								return row.startDate + "天" + "-" + row.endDate + "天";
							} else {
								return "大于等于" + row.startDate + "天";
							}

						}
					}, {
						field: 'ratio',
					}, ]
				}
				// 设置奖励收益表格初始化
			$('#productRewardTable').bootstrapTable(productRewardTableConfig)

			// 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.name = form.name.value.trim()
				pageOptions.type = form.type.value.trim()
				return val
			}
			
			function qryInfo(value,row){
				http.post(config.api.productDetail, {
					data: {
						oid: row.oid
					},
					contentType: 'form'
				}, function(result) {
					if(result.errorCode == 0) {
						var data = result;

						switch(data.typeOid) {
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
						if(data.investFiles != null && data.investFiles.length > 0) {
							for(var i = 0; i < data.investFiles.length; i++) {
								productDetailInvestFiles.push(data.investFiles[i])
							}
						}
						$('#productDetailInvestFileTable').bootstrapTable('load', productDetailInvestFiles)

						var productDetailServiceFiles = []
						if(data.serviceFiles != null && data.serviceFiles.length > 0) {
							for(var i = 0; i < data.serviceFiles.length; i++) {
								productDetailServiceFiles.push(data.serviceFiles[i])
							}
						}
						$('#productDetailServiceFileTable').bootstrapTable('load', productDetailServiceFiles)

						var productDetailFiles = []
						if(data.files != null && data.files.length > 0) {
							for(var i = 0; i < data.files.length; i++) {
								productDetailFiles.push(data.files[i])
							}
						}
						$('#productDetailFileTable').bootstrapTable('load', productDetailFiles)

						var productRewards = []
						if(data.rewards != null && data.rewards.length > 0) {
							for(var i = 0; i < data.rewards.length; i++) {
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