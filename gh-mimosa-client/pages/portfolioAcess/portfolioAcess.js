/**
 * 投资组合审核管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'portfolioAcess',
		init: function() {
			
			//投资组合  创建时间校验  开始
			$('#createTimeStartDate,#createTimeEndDate').on('blur', function() {
				validCDate()
			})
			//投资组合  创建时间校验
			function validCDate() {
				var flag = true
				$('#createTimeStart').removeClass("has-error")
				$('#createTimeEnd').removeClass("has-error")
				$('#createTimeStartErr').html('')
				$('#createTimeEndErr').html('')
				var data1 = $('#createTimeStartDate').val()
				var data2 = $('#createTimeEndDate').val()
				if (Date.parse(data1) > Date.parse(data2)) {
					$('#createTimeEndErr').html('结束日期必须大于开始日期')
					$('#createTimeEnd').addClass("has-error")
					flag = false
				}
				$('#createTimeStartDate').data("DateTimePicker").maxDate(data2);
				$('#createTimeEndDate').data("DateTimePicker").minDate(data1); 
//				$('#createTimeEndDate').data("DateTimePicker").maxDate(rlt.maxProfitDeadlineDate); 
				return flag
			}
			//投资组合  创建时间校验  结束
			
			
			
			// 投资组合审核 表格配置  开始
			var portfolioAuditPageOptions = {
				page: 1,
				rows: 10,
				name: '',
				createTime:''
			};
			
			var portfolioAuditTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getAuditListByParams, {
						data: portfolioAuditPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: portfolioAuditPageOptions.page,
				pageSize: portfolioAuditPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					var form = document.portfolioSearchFrom
				$.extend(portfolioAuditPageOptions, util.form.serializeJson(form));
					portfolioAuditPageOptions.rows = val.limit
					portfolioAuditPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'name':
							qryPortfolioAuditInfo(value, row)
							break
					}
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (portfolioAuditPageOptions.page - 1) * portfolioAuditPageOptions.rows + index + 1
					}
				}, {
					field: 'createTime',
					align: 'right'
				},{
					field: 'spvName',
					align: 'left'
				}, {
					field: 'name',
					align: 'left',
					class:"table_title_detail"
				}, {
					field: 'manageRate',
					align: 'right',
					formatter: function(val) {
						if (val) {
							return formatPercent(val)
						}
					}
				}, {
					field: 'trusteeRate',
					align: 'right',
					formatter: function(val) {
						if (val) {
							return formatPercent(val)
						}
					}
				}, {
					field: 'state',
					align: 'left',
					formatter: function(val, row) {
						var className = ''
						if (val === 'PRETRIAL') {
							className = 'text-yellow'
							return '<span class="' + className + '">审核中</span>'
						}
						if (val === 'DURATION') {
							className = 'text-green'
							return '<span class="' + className + '">通过</span>'
						}
						if (val === 'REJECT') {
							className = 'text-red'
							return '<span class="' + className + '">驳回</span>'
						}

					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#portfolioAuditTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '通过',
									type: 'button',
									class: 'item-yes',
									isRender: row.state === 'PRETRIAL' && row.state !== 'DURATION'
								}, {
									text: '驳回',
									type: 'button',
									class: 'item-no',
									isRender: row.state ==='PRETRIAL' && row.state !== 'DURATION'
								}]
							}]
						return util.table.formatter.generateButton(buttons, 'portfolioAuditTable')
					},
					events: {
						'click .item-yes': function(e, val, row) {
							var modal = $('#portfolioAuditModal_yes');
							$('#doPortfolioAudit_yes').removeAttr('disabled');
							modal.modal('show');
							$('#doPortfolioAudit_yes').off().on('click', function() {
								$('#doPortfolioAudit_yes').attr('disabled',true);
								http.post(config.api.portfolio.auditToPorfolio, {
									data: {
										oid: row.oid,
										operate:  $(document.portfolioAuditFrom_yes.operate_yes).val(),
										auditMark: $(document.portfolioAuditFrom_yes.auditMark_yes).val()
									},
									contentType: 'form'
								}, function(json) {
									$('#doPortfolioAudit_yes').attr('disabled',false);
									modal.modal('hide');
									$('#portfolioAuditTable').bootstrapTable('refresh');
								})
							})
						},
						'click .item-no': function(e, val, row) {
							var modal = $('#portfolioAuditModal_no');
							$('#doPortfolioAudit_no').removeAttr('disabled');
							modal.modal('show');
							$('#doPortfolioAudit_no').off().on('click', function() {
								$('#doPortfolioAudit_no').attr('disabled',true);
								http.post(config.api.portfolio.auditToPorfolio, {
									data: {
										oid: row.oid,
										operate:  $(document.portfolioAuditFrom_no.operate_no).val(),
										auditMark: $(document.portfolioAuditFrom_no.auditMark_no).val()
									},
									contentType: 'form'
								}, function(json) {
									$('#doPortfolioAudit_no').attr('disabled',false);
									modal.modal('hide');
									$('#portfolioAuditTable').bootstrapTable('refresh')
								})
							})
						}
					}
				}]
			}
			$('#portfolioAuditTable').bootstrapTable(portfolioAuditTableConfig)
			// 投资组合审核 表格配置 结束
			
			//搜索框初始化
			$$.searchInit($('#portfolioSearchFrom'), $('#portfolioAuditTable'));
			
			// 净值校准审核 表格配置  开始
			var netValueAuditPageOptions = {
				page: 1,
				rows: 10,
				portfolioOid:''
			}
			
			var netValueAuditTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getListByAuditing, {
						data: netValueAuditPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: netValueAuditPageOptions.page,
				pageSize: netValueAuditPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					var form = document.netValueSearchFrom
				$.extend(netValueAuditPageOptions, util.form.serializeJson(form));
					netValueAuditPageOptions.rows = val.limit
					netValueAuditPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (netValueAuditPageOptions.page - 1) * netValueAuditPageOptions.rows + index + 1
					}
				},{
					field: 'portfolioName',
					align: 'left'
				},{
					field: 'netDate',
					align: 'right'
				},{
					field: 'nav',
					align: 'right'
				},{
					field: 'share',
					align: 'right'
				}, {
					field: 'net',
					align: 'right'
				}, {
					field: 'orderState',
					align: 'left',
					formatter: function(val) {
						var className = ''
						if(val == 'SUBMIT') {
							className = 'text-yellow'
							return '<span class="' + className + '">待审核</span>'
						}
						if(val == 'PASS') {
							className = 'text-green'
							return '<span class="' + className + '">通过</span>'
						}
						if(val == 'FAIL') {
							className = 'text-red'
							return '<span class="' + className + '">驳回</span>'
						}
						if(val == 'DELETE') {
							className = 'text-red'
							return '<span class="' + className + '">已删除</span>'
						}
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row,index) {
					var buttons = [{
							text: '操作',
							type: 'buttonGroup',
//							isCloseBottom: index >= $('#netValueAuditTable').bootstrapTable('getData').length - 1,
							sub:[{
								text: '通过',
								type: 'button',
								class: 'item-yes',
								isRender: row.orderState == 'SUBMIT'
							}, {
								text: '驳回',
								type: 'button',
								class: 'item-no',
								isRender: row.orderState == 'SUBMIT'
							}]
						}]
						return util.table.formatter.generateButton(buttons, 'netValueAuditTable')
					},
					events: {
						'click .item-yes': function(e, val, row) {
							var modal = $('#netValueAuditModal_yes');
							$('#doNetValueAudit_yes').removeAttr('disabled');
							modal.modal('show');
							$('#doNetValueAudit_yes').off().on('click', function() {
								$('#doNetValueAudit_yes').attr('disabled',true);
								http.post(config.api.portfolio.pass, {
									data: {
										oid: row.oid,
										auditMark: $(document.netValueAuditFrom_yes.auditMark_yes_2).val()
									},
									contentType: 'form'
								}, function(json) {
									$('#doNetValueAudit_yes').attr('disabled',false);
									modal.modal('hide');
									$('#netValueAuditTable').bootstrapTable('refresh');
								})
							})
						},
						'click .item-no': function(e, val, row) {
							var modal = $('#netValueAuditModal_no');
							$('#doNetValueAudit_no').removeAttr('disabled');
							modal.modal('show');
							$('#doNetValueAudit_no').off().on('click', function() {
								$('#doNetValueAudit_no').attr('disabled',true);
								http.post(config.api.portfolio.fail, {
									data: {
										oid: row.oid,
										auditMark: $(document.netValueAuditFrom_no.auditMark_no_2).val()
									},
									contentType: 'form'
								}, function(json) {
									$('#doNetValueAudit_no').attr('disabled',true);
									modal.modal('hide');
									$('#netValueAuditTable').bootstrapTable('refresh');
								})
							})
						}
					}
				}]
			}
			$('#netValueAuditTable').bootstrapTable(netValueAuditTableConfig)
			// 净值校准审核 表格配置 结束
			
			//搜索框初始化
			$$.searchInit($('#netValueSearchFrom'), $('#netValueAuditTable'));
			
			// 资产交易审核 表格配置  开始
			var assetAuditPageOptions = {
				page: 1,
				rows: 10
			}
			
			var assetAuditTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.getToAuditMarketOrderListByPortfolioOid, {
						data: assetAuditPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: assetAuditPageOptions.page,
				pageSize: assetAuditPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					var form = document.assetSearchFrom
					$.extend(assetAuditPageOptions, util.form.serializeJson(form));
					assetAuditPageOptions.rows = val.limit
					assetAuditPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				onClickCell: function (field, value, row, $element) {
					switch (field) {
						case 'portfolioName':
							qryAssetAuditInfo(value,row)
							break
					}
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (assetAuditPageOptions.page - 1) * assetAuditPageOptions.rows + index + 1
					}
				},{
					field: 'orderDate',
					align: 'right'
				}, {
					field: 'portfolioName',
					align: 'left',
					class:"table_title_detail"
				},{
					field: 'assetName',
					align: 'left'
				},  {
					field: 'assetType',
					align: 'left',
					formatter: function(val) {
						return formatAssetType(val)
					}
				},{
					field: 'dealType',
					align: 'left',
					formatter: function(val) {
						return formatDealType(val)
					}
				}, {
					field: 'orderAmount',
					align: 'right',
					formatter: function(val, row) {
						switch(row.dealType) {
							case "PURCHASE":
							case "SUBSCRIPE":
							case "REDEEM":
							case "SELLOUT":
							case "REFUND":
							case "TRANSFER":
							case "OVERDUETRANS":
							case "CANCELLATE":
							case "OVERDUECANCELLATE":
								return formatNumber(row.orderAmount);
								break;
							case "REPAYMENT":
								return formatNumber(row.capital + row.income);
								break;
						}
						return null;
					}
				}, {
					field: 'tradeShare',
					align: 'right',
					formatter: function(val, row) {
						switch(row.dealType) {
							case "PURCHASE":
							case "SUBSCRIPE":
							case "REDEEM":
							case "SELLOUT":
							case "REFUND":
							case "TRANSFER":
							case "OVERDUETRANS":
							case "CANCELLATE":
							case "OVERDUECANCELLATE":
								return formatNumber(row.tradeShare);
								break;
							case "REPAYMENT":
								return formatNumber(row.capital);
								break;
						}
						return null;
					}
				}, {
					field: 'orderState',
					align: 'left',
					formatter: function(val, row) {
						if (val === 'SUBMIT') {
							return '<span class="text-yellow">待审核</span>'
						}
					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#assetAuditTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '详情',
									type: 'button',
									class: 'item-detail',
									isRender: row.state !== 'DELETE'
								}, {
									text: '通过',
									type: 'button',
									class: 'item-yes',
									isRender: row.state !== 'DELETE' && row.state !== 'PASS'
								}, {
									text: '驳回',
									type: 'button',
									class: 'item-no',
									isRender: row.state !=='FAIL' && row.state !== 'PASS' && row.state !== 'DELETE'
								}]
							}]
						return util.table.formatter.generateButton(buttons, 'assetAuditTable')
					},
					events: {
						'click .item-detail': function(e, val, row) {
							http.post(config.api.portfolio.getMarketOrderByOid, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result.result;
								data.assetType = formatAssetType(data.assetType);
								if(data.dealType == "REPAYMENT"){
									data.orderAmount = formatNumber(data.capital+data.income);
									data.tradeShare = formatNumber(data.capital);
								} else {
									data.orderAmount = formatNumber(data.orderAmount);
									data.tradeShare = formatNumber(data.tradeShare);
								}
								data.dealType = formatDealType(data.dealType);
								$$.detailAutoFix($('#assetDealForm'), data); // 自动填充详情
								$$.formAutoFix($('#assetDealForm'), data); // 自动填充表单
								$('#assetDealDetailModal').modal('show');
							})
						},
						'click .item-yes': function(e, val, row) {
							var modal = $('#assetAuditModal_yes');
							$('#doAssetAudit_yes').removeAttr('disabled');
							modal.modal('show');
							$('#doAssetAudit_yes').off().on('click', function() {
								if (row.assetType == 'CASHTOOLTYPE_01' || row.assetType == 'CASHTOOLTYPE_02') {
									if (row.dealType == 'PURCHASE') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passForPurchaseLiquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'REDEEM') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passRedeemForLiquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
								} else {
									if (row.dealType == 'SUBSCRIPE') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passForSubscripeIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide')
											$('#assetAuditTable').bootstrapTable('refresh')
										})
									}
									if (row.dealType == 'PURCHASE') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passForPurchaseIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'REPAYMENT') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passRepaymentForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'SELLOUT') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passSelloutForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'TRANSFER') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passTransferForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'OVERDUETRANS') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passOverduetransForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'CANCELLATE') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passCancellateForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'OVERDUECANCELLATE') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passOverdueCancellateForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'REFUND') {
										$('#doAssetAudit_yes').attr('disabled',true);
										http.post(config.api.portfolio.passRefundForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_yes.auditMark_yes).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_yes').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
								}
							})
						},
						'click .item-no': function(e, val, row) {
							var modal = $('#assetAuditModal_no');
							modal.modal('show');
							$('#doAssetAudit_no').removeAttr('disabled');
							$('#doAssetAudit_no').off().on('click', function() {
								if (row.assetType == 'CASHTOOLTYPE_01' || row.assetType == 'CASHTOOLTYPE_02') {
									if (row.dealType == 'PURCHASE') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failForPurchaseLiquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'REDEEM') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failRedeemForLiquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
								} else {
									if (row.dealType == 'PURCHASE') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failForPurchaseIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'SUBSCRIPE') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failForubscripeIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'REPAYMENT') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failRepaymentForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'SELLOUT') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failSelloutForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'TRANSFER') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failTransferForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'OVERDUETRANS') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failOverduetransForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'CANCELLATE') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failCancellateForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'OVERDUECANCELLATE') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failOverdueCancellateForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
									if (row.dealType == 'REFUND') {
										$('#doAssetAudit_no').attr('disabled',true);
										http.post(config.api.portfolio.failRefundForIlliquid, {
											data: {
												oid: row.oid,
												auditMark: $(document.assetAuditFrom_no.auditMark_no).val()
											},
											contentType: 'form'
										}, function(json) {
											$('#doAssetAudit_no').attr('disabled',false);
											modal.modal('hide');
											$('#assetAuditTable').bootstrapTable('refresh');
										})
									}
								}
							})
						}
					}
				}]
			}
			$('#assetAuditTable').bootstrapTable(assetAuditTableConfig)
			// 资产交易审核 表格配置 结束
			
			//搜索框初始化
			$$.searchInit($('#assetSearchFrom'), $('#assetAuditTable'));
			
			// 收益分配审核 表格配置  开始
			var profitAuditPageOptions = {
				page: 1,
				rows: 10,
				assetPoolName:''
			}
			
			var profitAuditTableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.income.getIncomeAdjustAuditList, {
						data: profitAuditPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: profitAuditPageOptions.page,
				pageSize: profitAuditPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					var form = document.profitSearchFrom
					$.extend(profitAuditPageOptions, util.form.serializeJson(form));
					profitAuditPageOptions.rows = val.limit
					profitAuditPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (profitAuditPageOptions.page - 1) * profitAuditPageOptions.rows + index + 1
					}
				},{
					field: 'assetPoolName',
					align: 'left'
				}, {
					field: 'productName',
					align: 'left'
				},{
					field: 'baseDate',
					align: 'left'
				},  {
					field: 'totalAllocateIncome',
					align: 'right'
				},{
					field: 'capital',
					align: 'right'
				}, {
					field: 'allocateIncome',
					align: 'right'
				}, {
					field: 'rewardIncome',
					align: 'right'
				}, {
					field: 'couponIncome',
					align: 'right'
				}, /* {
					field: 'successAllocateIncome',
					align: 'right'
				}, {
					field: 'successAllocateRewardIncome',
					align: 'right'
				}, {
					field: 'successAllocateCouponIncome',
					align: 'right' 
				}, */{
					field: 'leftAllocateIncome',
					align: 'right'
				}, {
					field: 'ratio',
					align: 'right'
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row,index) {
						var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#profitAuditTable').bootstrapTable('getData').length - 1,
								sub:[{
									text: '通过',
									type: 'button',
									class: 'item-yes',
									isRender: row.state !== 'DELETE' && row.state !== 'PASS'
								}, {
									text: '驳回',
									type: 'button',
									class: 'item-no',
									isRender: row.state !=='FAIL' && row.state !== 'PASS' && row.state !== 'DELETE'
								}]
							}]
								
						return util.table.formatter.generateButton(buttons, 'profitAuditTable')
					},
					events: {
						'click .item-yes': function(e, val, row) {
							var modal = $('#profitAuditModal_yes');
							$('#doProfitAudit_yes').removeAttr('disabled');
							modal.modal('show');
							$('#doProfitAudit_yes').off().on('click',function(){
								$('#doProfitAudit_yes').attr('disabled',true);
								http.post(config.api.duration.income.auditPassIncomeAdjust, {
									data: {
										oid: row.oid
									},
									contentType: 'form'
								}, function(json) {
									$('#doProfitAudit_yes').attr('disabled',false);
									modal.modal('hide');
									$('#profitAuditTable').bootstrapTable('refresh');
								})
							})
						},
						'click .item-no': function(e, val, row) {
							var modal = $('#profitAuditModal_no');
							$('#doProfitAudit_no').removeAttr('disabled');
							modal.modal('show');
							$('#doProfitAudit_no').off().on('click',function(){
								$('#doProfitAudit_no').attr('disabled',true);
								http.post(config.api.duration.income.auditFailIncomeAdjust, {
									data: {
										oid: row.oid
									},
									contentType: 'form'
								}, function(json) {
									$('#doProfitAudit_no').attr('disabled',false);
									modal.modal('hide');
									$('#profitAuditTable').bootstrapTable('refresh');
								})
							})
						}
					}		
				}]
			}
			
			$('#profitAuditTable').bootstrapTable(profitAuditTableConfig)
			// 收益分配审核 表格配置 结束
			
			//搜索框初始化
			$$.searchInit($('#profitSearchFrom'), $('#profitAuditTable'));
			
			// 审核记录 表格配置  开始
			var auditRecordPageOptions = {
				page: 1,
				rows: 10
			}
			
			var auditRecordTableConfig = {
				ajax: function(origin) {
					http.post(config.api.portfolio.auditRecordList, {
						data: auditRecordPageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: auditRecordPageOptions.page,
				pageSize: auditRecordPageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: function(val) {
					auditRecordPageOptions.rows = val.limit
					auditRecordPageOptions.page = parseInt(val.offset / val.limit) + 1
					return val
				},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (auditRecordPageOptions.page - 1) * netValueAuditPageOptions.rows + index + 1
					}
				},{
					field: 'targetName',
					align: 'left'
				},{
					field: 'auditType',
					align: 'right'
				},{
					field: 'orderDate',
					align: 'right'
				},{
					field: 'creater',
					align: 'left'
				}, {
					field: 'auditTime',
					align: 'right'
				}, {
					field: 'auditor',
					align: 'left'
				},{
					field: 'auditState',
					align: 'left',
					formatter: function(val, row) {
						if (val === 'PASS') {
							return '<span class="text-green">通过</span>'
						}
						if (val === 'REJECT') {
							return '<span class="text-red">驳回</span>'
						}

					}
				}, {
					width: 150,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '审核意见',
							type: 'button',
							class: 'item-auditMark'
						}]
						return util.table.formatter.generateButton(buttons, 'auditRecordTable')
					},
					events: {
						'click .item-auditMark': function(e, val, row) {
							http.post(config.api.portfolio.getNetValueInfo, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result.result;
								$$.detailAutoFix($('#auditRecordFrom'), data); // 自动填充详情
								$$.formAutoFix($('#auditRecordFrom'), data); // 自动填充表单
								$('#auditRecordTable').modal('show');
							})
						}
					}
				}]
			}
			$('#auditRecordTable').bootstrapTable(auditRecordTableConfig)
			// 审核记录 表格配置 结束
		}
		
	}
		
	/**
	 * 格式化单位为（万元）
	 * @param {Object} val
	 */
	function formatUnitToWan(val) {
		if (val) {
			val = parseFloat(val)
			return util.safeCalc(val, '/', 10000, 6)
		} else {
			return 0
		}
	}
	
	/**
	 * 格式化交易类型
	 * @param {Object} val
	 */
	function formatDealType(val) {
		if (val === 'PURCHASE') {
			return '申购'
		}
		if (val === 'SUBSCRIPE') {
			return '认购'
		}
		if (val === 'REDEEM') {
			return '赎回'
		}
		if (val === 'REPAYMENT') {
			return '还款'
		}
		if (val === 'SELLOUT') {
			return '转让'
		}
		if (val === 'TRANSFER') {
			return '转让'
		}
		if (val === 'OVERDUETRANS') {
			return '转让'
		}
		if (val === 'CANCELLATE') {
			return '坏账核销'
		}
		if (val === 'OVERDUECANCELLATE') {
			return '逾期坏账核销'
		}
		if (val === 'REFUND') {
			return '退款'
		}
	}
	
	/**
	 * 格式化资产标的类型
	 * @param {Object} val
	 */
	function formatAssetType(val) {
		if(val === 'CASHTOOLTYPE_01') {
			return '货币基金'
		}
		if(val === 'CASHTOOLTYPE_02') {
			return '协定存款'
		}
		if(val === 'TARGETTYPE_05') {
			return '券商资管计划'
		}
		if(val === 'TARGETTYPE_06') {
			return '基金/基金子公司资管计划'
		}
		if(val === 'TARGETTYPE_07') {
			return '保险资管计划'
		}
		if(val === 'TARGETTYPE_04') {
			return '信托计划-房地产类'
		}
		if(val === 'TARGETTYPE_03') {
			return '信托计划-政信类'
		}
		if(val === 'TARGETTYPE_12') {
			return '信托计划-工商企业类'
		}
		if(val === 'TARGETTYPE_13') {
			return '信托计划-金融产品投资类'
		}
		if(val === 'TARGETTYPE_01') {
			return '证券类'
		}
		if(val === 'TARGETTYPE_02') {
			return '股权投资类'
		}
		if(val === 'TARGETTYPE_14') {
			return '银行理财类'
		}
		if(val === 'TARGETTYPE_16') {
			return '商票'
		}
		if(val === 'TARGETTYPE_15') {
			return '银票'
		}
		if(val === 'TARGETTYPE_17') {
			return '现金贷'
		}
		if(val === 'TARGETTYPE_18') {
			return '消费分期'
		}
		if(val === 'TARGETTYPE_19') {
			return '供应链金融产品类'
		}
		if(val === 'TARGETTYPE_20') {
			return '房抵贷'
		}
		if(val === 'TARGETTYPE_08') {
			return '债权及债权收益类'
		}
	}
	
	/**
	 * 格式化以千分位展示
	 * @param {Object} val
	 */
	function formatNumber(val) {
		if (val) {
			val = formatUnitToWan(val)
			return $.number(val, 6)
		} else {
			return 0
		}
	}
		
	/**
	 * 格式化单位为
	 * 以千分位展示
	 * @param {Object} val
	 */
	function formatPercent(val) {
		if (val) {
			val = parseFloat(val)
			return util.safeCalc(val, '*', 100, 4)
		} else {
			return 0
		}
	}
	
	function qryPortfolioAuditInfo(val, row) {
		http.post(config.api.portfolio.getPortfolioByOid, {
			data: {
				oid: row.oid
			},
			contentType: 'form'
		}, function(result) {

			var data = result.result;
			var types = config.target_type();
			var scopes = {}
			var hasScopes = false;
			$.each(data.scopes, function(i) {
				var scope = data.scopes[i];
				$.each(types, function(tkey) {
					if(types[tkey][scope.oid]) {
						if(scopes[tkey] == undefined) {
							scopes[tkey] = []
						}
						scopes[tkey].push(types[tkey][scope.oid])
						hasScopes = true;
					}
				})
			});

			var scopeView = $('#scopesDetail');
			scopeView.empty();
			if (hasScopes) {
				$.each(scopes, function(key) {
					$('<div>' + key + ':&nbsp;' + scopes[key].join(',&nbsp;') + '</div>').appendTo(scopeView)
				});
			} else {
				$('<div>--</div>').appendTo(scopeView)
			}
			data.cashRate = util.safeCalc(data.cashRate, '*', 100, 2);
			data.liquidRate = util.safeCalc(data.liquidRate, '*', 100, 2);
			data.illiquidRate = util.safeCalc(data.illiquidRate, '*', 100, 2);
			data.manageRate = util.safeCalc(data.manageRate, '*', 100, 2);
			data.trusteeRate = util.safeCalc(data.trusteeRate, '*', 100, 2);
			$$.detailAutoFix($('#detPortfolioForm'), data); // 自动填充详情
			$$.formAutoFix($('#detPortfolioForm'), data); // 自动填充表单
			$('#portfolioDetailModal').modal('show');
		})
	}
	
	
	function qryAssetAuditInfo( val, row) {
		http.post(config.api.portfolio.getMarketOrderByOid, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result.result;
								data.assetType = formatAssetType(data.assetType);
								if(data.dealType == "REPAYMENT"){
									data.orderAmount = formatNumber(data.capital+data.income);
									data.tradeShare = formatNumber(data.capital);
								} else {
									data.orderAmount = formatNumber(data.orderAmount);
									data.tradeShare = formatNumber(data.tradeShare);
								}
								data.dealType = formatDealType(data.dealType);
								$$.detailAutoFix($('#assetDealForm'), data); // 自动填充详情
								$$.formAutoFix($('#assetDealForm'), data); // 自动填充表单
								$('#assetDealDetailModal').modal('show');
							})
	}

	
})
