/**
 * 发行人交易管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'spvTrade',
		init: function() {
			var orderAmount = 0
			var orderType = ''
			var reemAmount = 0
				// 数据表格分页、搜索条件配置
			var pageOptions = {
				number: 1,
				size: 10,
				name: '',
				type: ''
			}
			
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.spvOrderList, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							assetPoolName: pageOptions.assetPoolName,
							productName: pageOptions.productName,
							orderStatus: pageOptions.orderStatus,
							orderType: pageOptions.orderType,
							orderCate: '', //pageOptions.orderCate,
							entryStatus: ''//pageOptions.entryStatus
						},
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
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
						case 'spvName':
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
					field: 'spvName',
					class:"table_title_detail"
				},{
					field: 'productName',
				}, {
					field: 'orderType',
					formatter: function(val) {
						switch (val) {
							case 'INVEST':
								return '充值'
							case 'REDEEM':
								return '提现'
							case 'BUY_IN':
								return '买入'
							case 'PART_SELL_OUT':
								return '部分卖出'
							case 'FULL_SELL_OUT':
								return '全部卖出'
							default:
								return '-'
						}
					}
				}, /*{
					field: 'orderCate',
					align: 'center',
					formatter: function(val) {
						switch (val) {
							case 'TRADE':
								return '交易订单'
							case 'STRIKE':
								return '冲账订单'
							default:
								return '-'
						}
					}
				},*/ {
					field: 'orderAmount',
					class: 'currency6',
					align: 'right'
				}, {
					field: 'orderDate',
					align: 'right'
				}, {
					field: 'orderStatus',
					formatter: function(val) {
						var className = '';
						switch (val) {
							case 'SUBMIT':
								className = 'text-red';
								return '<span class="' + className + '">未确认</span>'
							case 'CONFIRM':
								className = 'text-green';
								return '<span class="' + className + '">确认</span>'
							case 'DISABLE':
								className = 'text-red';
								return '<span class="' + className + '">失效</span>'
							case 'CALCING':
								className = 'text-yellow';
								return '<span class="' + className + '">清算中</span>'
							default:
								return '-'
						}
					}
				}, {
					field: 'assetPoolName',
				}, {
					field: 'auditor',
				}, {
					field: 'completeTime',
					align: 'right'
				}, {
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
							text: '操作',
							type: 'buttonGroup',
//							isCloseBottom: index >= $('#spvOrderTable').bootstrapTable('getData').length - 1,
							sub:[{
								text: '作废',
								type: 'button',
								class: 'item-invalid',
								isRender: row.orderStatus == 'SUBMIT'
							}, {
								text: '审核确定',
								type: 'button',
								class: 'item-audit',
								isRender: row.orderStatus == 'SUBMIT'
							}]
						}]
						return util.table.formatter.generateButton(buttons, 'spvOrderTable');
					},
					events: {
						
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html("确定作废该订单吗?")
							// $("#confirmTitle1").html(row.orderCode + "的订单吗？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.spvOrderInvalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#spvOrderTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-audit': function(e, value, row) {
							util.form.reset($('#auditInvestorOrderForm'))
							var form = document.auditInvestorOrderForm
							$(form).validator('destroy')
							http.post(config.api.spvOrderDetail, {
								data: {
									oid: row.oid
								},
								contentType: 'form',
							}, function(result) {
								if (result.errorCode == 0) {
									var data = result
									$$.detailAutoFix($('#auditInvestorOrderModal'), data) // 自动填充详情
									$$.formAutoFix($(form), data) // 自动填充表单
									orderAmount = data.orderAmount
									orderType = data.orderType
									reemAmount = data.reemAmount
									$(form.payFeeValue).trigger('input')

									if (data.orderType == 'REDEEM') {
										$('#reemAmount').show()
									} else {
										$('#reemAmount').hide()
									}
									$(form).validator({
										custom: {
											validfloat: util.form.validator.validfloat,
											validredeemaddorder: validredeemaddorder
										},
										errors: {
											validfloat: '数据格式不正确',
											validredeemaddorder: '可售余额不能大于可赎回额度' //'订单金额不能大于xxx额度'
										}
									})
									$(form.avaibleAmount).trigger('input')

									document.auditInvestorOrderForm.payFee.value = document.auditInvestorOrderForm.payFeeValue.value
									$('#payFeeLabel').show()
									$('#payFeeLabelAdd').hide()
									$('#payFeeLabelSub').hide()

									$('#auditInvestorOrderModal').modal('show');
								} else {
									alert(查询失败);
								}
							})
						}

					}
				}]
			}

			// 数据表格初始化
			$('#spvOrderTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#spvOrderTable'))
				// 添加产品表单验证初始化
			util.form.validator.init($('#addOrderForm'))

			// 自定义验证-订单审核-可售余额在orderType="REDEEM"时不可大于reemAmount
			function validredeemaddorder($el) {
				return orderType === 'INVEST' || (Number($el.val()) <= reemAmount)
			}

			// 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.productName = form.productName.value.trim()
				pageOptions.orderStatus = form.orderStatus.value.trim()
				pageOptions.orderType = form.orderType.value.trim()
				pageOptions.orderCate = ''//form.orderCate.value.trim()
				pageOptions.entryStatus = ''//form.entryStatus.value.trim()
				pageOptions.assetPoolName = form.assetPoolName.value.trim()
				return val
			}

			// 新建订单按钮点击事件
			$('#orderAdd').on('click', function() {
				http.post(config.api.portfolio.getAllNameList, function(result) {
					
					/*
					$(document.addOrderForm.orderType).off().on('change', function(){
						if (document.addOrderForm.orderType.value == 'INVEST') {
							
						}
						if (document.addOrderForm.orderType.value == 'REDEEM') {
							
						}
					});
					*/
					
					var select = document.addOrderForm.assetPoolOid
					$(select).empty()
					result.rows.forEach(function(item, index) {
						$(select).append('<option value="' + item.oid + '" ' + (!index ? 'checked' : '') + '>' + item.name + '</option>')
					})

					if (result.rows.length > 0) {
						http.post(
							config.api.spvOrderProduct, {
								data: {
									assetPoolOid: result.rows[0].oid
								},
								contentType: 'form',
							},
							function(rlt) {
								if (rlt.errorCode == 0 && rlt.oid != null) {
									$('#productName').val(rlt.name)
									$('#productNameDiv').show()
								} else {
									$('#productNameDiv').hide()
								}
							})

						http.post(config.api.portfolio.getPortfolioByOid, {
							data: {
								oid: result.rows[0].oid
							},
							contentType: 'form',
						}, function(rlt) {
							if (rlt.errorCode == 0 && rlt.result != null) {
								document.addOrderForm.spvName.value = rlt.result.spvName
							} else {
								document.addOrderForm.spvName.value = ''
							}

						})

					}

				})

				util.form.reset($('#addOrderForm'))
				$('#addOrderModal').modal('show')
			})

			// 新建产品“保存”按钮点击事件
			$('#addOrderSubmit').on('click', function() {
				if (!$('#addOrderForm').validator('doSubmitCheck')) return
				
				$('#addOrderModal').modal('hide')

				$('#addOrderForm').ajaxSubmit({
					url: config.api.saveSpvOrder,
					success: function(addResult) {
						util.form.reset($('#addOrderForm'))
						$('#spvOrderTable').bootstrapTable('refresh')
					}
				})
			})

			$('#assetPoolOid').on('change', function() {
				if (this.value != '') {
					http.post(config.api.spvOrderProduct, {
						data: {
							assetPoolOid: this.value
						},
						contentType: 'form',
					}, function(rlt) {
						if (rlt.errorCode == 0 && rlt.oid != null) {
							$('#productName').val(rlt.name)
							$('#productNameDiv').show()
						} else {
							$('#productNameDiv').hide()
						}
					})

					http.post(config.api.portfolio.getPortfolioByOid, {
						data: {
							oid: this.value
						},
						contentType: 'form',
					}, function(rlt) {
						if (rlt.errorCode == 0 && rlt.result != null) {
							document.addOrderForm.spvName.value = rlt.result.spvName
						} else {
							document.addOrderForm.spvName.value = ''
						}

					})

				}
			})

			// 可售余额和应付费金输入框input事件绑定
			$(document.auditInvestorOrderForm.avaibleAmount).on('input', function() {
				var val = parseFloat(this.value) || 0

				var payFee = parseFloat(parseInt(orderAmount * 1000000) - parseInt(val * 1000000)) / 1000000
				if (payFee < 0) {
					$('#payFeeLabel').hide()
					$('#payFeeLabelAdd').hide()
					$('#payFeeLabelSub').show()
					document.auditInvestorOrderForm.payFeeValue.value = Math.abs(payFee)
				} else if (payFee > 0) {
					$('#payFeeLabel').hide()
					$('#payFeeLabelAdd').show()
					$('#payFeeLabelSub').hide()
					document.auditInvestorOrderForm.payFeeValue.value = payFee
				} else {
					$('#payFeeLabel').show()
					$('#payFeeLabelAdd').hide()
					$('#payFeeLabelSub').hide()
					document.auditInvestorOrderForm.payFeeValue.value = payFee
				}
				document.auditInvestorOrderForm.payFee.value = payFee

			})
			$(document.auditInvestorOrderForm.payFeeValue).on('input', function() {
				var payFee = parseFloat(this.value) || 0

				if (payFee < 0) {
					$('#payFeeLabel').hide()
					$('#payFeeLabelAdd').hide()
					$('#payFeeLabelSub').show()
					document.auditInvestorOrderForm.payFeeValue.value = Math.abs(payFee)
				} else if (payFee > 0) {
					$('#payFeeLabel').hide()
					$('#payFeeLabelAdd').show()
					$('#payFeeLabelSub').hide()
					document.auditInvestorOrderForm.payFeeValue.value = payFee
				} else {
					$('#payFeeLabel').show()
					$('#payFeeLabelAdd').hide()
					$('#payFeeLabelSub').hide()
					document.auditInvestorOrderForm.payFeeValue.value = payFee
				}
				document.auditInvestorOrderForm.payFee.value = payFee

				document.auditInvestorOrderForm.avaibleAmount.value = parseFloat(parseInt(orderAmount * 1000000) - parseInt(payFee * 1000000)) / 1000000
			})

			// 审核确定订单“确定”按钮点击事件
			$('#auditInvestorOrderSubmit').on('click', function() {
				if (!$('#auditInvestorOrderForm').validator('doSubmitCheck')) return
				
				var payFee = document.auditInvestorOrderForm.payFeeValue.value;
				var avaibleAmount = document.auditInvestorOrderForm.avaibleAmount.value;
				
				if (parseFloat(payFee) + parseFloat(avaibleAmount) > parseFloat(orderAmount)) {
					alert('可售余额 + 应付费金 不能大于 订单金额！');
					return;
				}
				$('#auditInvestorOrderForm').ajaxSubmit({
					url: config.api.spvOrderConfirm,
					success: function(addResult) {
						if(addResult.errorCode==0) {
							$('#auditInvestorOrderModal').modal('hide')
							$('#spvOrderTable').bootstrapTable('refresh')
						} else {
							if(addResult.errorMessage==="请先在运营工作台发行渠道申请") {
								$('#issueChannelAlertModal').modal('show')
							} else {
								alert(addResult.errorMessage)
							}
						}
						
					}
				})
			})
			
			function qryInfo(value,row){
				http.post(config.api.spvOrderDetail, {
					data: {
						oid: row.oid
					},
					contentType: 'form'
				}, function(result) {
					var data = result;
					$$.detailAutoFix($('#spvTradeDetailModal'), data); // 自动填充详情
					$('#spvTradeDetailModal').modal('show');
				})
			}

		}
	}
})