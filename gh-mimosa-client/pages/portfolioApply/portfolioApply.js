/**
 * 投资组合管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'portfolioApply',
		init: function() {
			getSPVList(http, config)
			var initParam = util.nav.getHashObj(location.hash).init
			if(initParam === 'yes') {
				$('#addPortfolioModal').modal('show')
				$('#editPortfolioModal').modal('show')
			}
			// 分页配置
			var pageOptions = {
				name: "",
				page: 1,
				rows: 10
			}
			var settingTableConfig = {
				columns: [{
					formatter: function(val, row) {
						if(row.endAmount) {
							return row.startAmount + '万 - ' + row.endAmount + '万'
						} else {
							return row.startAmount + '万以上'
						}
					}
				}, {
					field: 'feeRatio',
					formatter: function(val) {
						return val + '%'
					}
				}, {
					width: 80,
					align: 'center',
					formatter: function(val) {
						var buttons = [{
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'settingTable')
					},
					events: {
						'click .item-delete': function(e, val, row) {
							var tableData = $('#settingTable').bootstrapTable('getData')
							tableData.splice(tableData.indexOf(row), 1)
							$('#settingTable').bootstrapTable('load', tableData)
						}
					}
				}]
			}
			var showSettingTableConfig = {
				columns: [{
					formatter: function(val, row) {
						if(row.endAmount) {
							return row.startAmount + '万 - ' + row.endAmount + '万'
						} else {
							return row.startAmount + '万以上'
						}
					}
				}, {
					field: 'feeRatio',
					formatter: function(val) {
						return val + '%'
					}
				}]
			}
			$('#settingTable').bootstrapTable(settingTableConfig)
			$('#showSettingTable').bootstrapTable(showSettingTableConfig)
			util.form.validator.init($('#addFeeForm'))
				// 数据表格配置
			var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.portfolio.portfolioList, {
							data: pageOptions,
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					},
					pageNumber: pageOptions.page,
					pageSize: pageOptions.rows,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getQueryParams,
					onLoadSuccess: function() {},
					onClickCell: function(field, value, row, $element) {
						switch(field) {
							case 'name':
								toDetail(value, row);
						}
					},
					columns: [{
							width: 60,
							align: 'center',
							formatter: function(val, row, index) {
								return(pageOptions.page - 1) * pageOptions.rows + index + 1
							}
						}, {
							// 名称
							field: 'name',
							align: 'left',
							class: 'table_title_detail'
						}, {
							// 发行人
							field: 'spvName',
							align: 'left'
						}, {
							// 银行存款比例
							field: 'cashRate',
							align: 'right',
							formatter: function(val) {
								return util.safeCalc(val, '*', 100, 4)
							}
						}, {
							// 现金类标的投资比例
							field: 'liquidRate',
							align: 'right',
							formatter: function(val) {
								return util.safeCalc(val, '*', 100, 4)
							}
						}, {
							// 非现金类标的投资比例
							field: 'illiquidRate',
							align: 'right',
							formatter: function(val) {
								return util.safeCalc(val, '*', 100, 4)
							}
						},{
							// 管理费率
							field: 'manageRate',
							align: 'right',
							formatter: function(val) {
								return formatPercent(val)
							}
						}, {
							// 托管费率
							field: 'trusteeRate',
							align: 'right',
							formatter: function(val) {
								return formatPercent(val)
							}
						}, {
							// 状态
							width: 70,
							align: 'left',
							//halign: 'left',
							field: 'state',
							formatter: function(val) {
								var className = ''
								var str = val
								switch(val) {
									case 'CREATE':
										className = 'text-yellow'
										str = "未审核"
										break
									case 'PRETRIAL':
										className = 'text-blue'
										str = "审核中"
										break
									case 'DURATION':
										className = 'text-green'
										str = "审核通过"
										break
									case 'REJECT':
										className = 'text-red'
										str = "驳回"
										break
								}
								return '<span class="' + className + '">' + str + '</span>'
							}
						}, {
							width: 280,
							align: 'center',
							formatter: function(val, row,index) {
								
								var buttons = [{
										text: '转到工作台',
										type: 'button',
										class: 'item-workbench',
										isRender: row.state === 'DURATION'
									}, {
										text: '提交审核',
										type: 'button',
										class: 'item-check',
										isRender: row.state === 'CREATE' || row.state === 'REJECT'
									}, {
										text: '撤销审核',
										type: 'button',
										class: 'item-cancel',
										isRender: row.state === 'PRETRIAL'
									}]
								var format = util.table.formatter.generateButton(buttons, 'showSettingTable')
				            	if(row.state === 'CREATE' || row.state === 'REJECT'){
				            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit"></span>'
				            		+'<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
				            	}
				            	return format
							},
							events: {
								'click .item-workbench': function(e, val, row) {
									util.nav.dispatch('portfolioManagement', 'id=' + row.oid)
								},
								'click .item-edit': function(e, val, row) {
									currentPool = row
									http.post(config.api.portfolio.getPortfolioByOid, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(json) {
										var result = json.result
										$('#editSPV').val(result.spvOid)
										result = resultDataFormat(result)
										$$.formAutoFix($('#editPortfolioForm'), result)
											// 获取投资范围
										var scopes = $(document.editPortfolioForm.scopes);
										$.each(scopes, function(i) {
											var scope = $(scopes[i]);
											var checked = false;
											if(json.result.scopes && json.result.scopes.length > 0) {
												for(var i = 0; i < json.result.scopes.length; i++) {
													if(json.result.scopes[i].oid == scope.val()) {
														checked = true;
													}
												}
											}

											scope.attr("checked", checked)
										});
										//$(document.editportfolioForm.scopes).val(json.result.scopes).trigger('change')
										
										$('#editPortfolioModal').modal('show')
									})
								},
								'click .item-check': function(e, value, row) {
									$("#confirmTitle").html("确定提交审核？")
									$$.confirm({
										container: $('#doConfirm'),
										trigger: this,
										accept: function() {
											http.post(config.api.portfolio.examine, {
												data: {
													oid: row.oid
												},
												contentType: 'form',
											}, function(result) {
												$('#portfolioApplyTable').bootstrapTable('refresh')
											})
										}
									})
								},
								'click .item-cancel': function(e, value, row) {
									$("#confirmTitle").html("确定撤销审核？")
									$$.confirm({
										container: $('#doConfirm'),
										trigger: this,
										accept: function() {
											http.post(config.api.portfolio.cancel, {
												data: {
													oid: row.oid
												},
												contentType: 'form',
											}, function(result) {
												$('#portfolioApplyTable').bootstrapTable('refresh')
											})
										}
									})
								},
								'click .item-delete': function(e, val, row) {
									currentPool = row
									$$.confirm({
										container: $('#confirmModal'),
										trigger: this,
										accept: function() {
											http.post(config.api.portfolio.deletePortfolio, {
												data: {
													pid: row.oid
												},
												contentType: 'form'
											}, function() {
												$('#portfolioApplyTable').bootstrapTable('refresh')
											})
										}
									})
								}
							}
						}
					]
				}
				// 初始化数据表格
			$('#portfolioApplyTable').bootstrapTable(tableConfig);
			// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#portfolioApplyTable'));
			// 新增/修改投资组合投资范围select2初始化
			//          $(document.addPortfolioForm.scopes).select2()
			//          $(document.editPortfolioForm.scopes).select2()
			// 新增投资组合按钮点击事件
			$('#portfolioAdd').on('click', function() {
				//          	$(document.addPortfolioForm.scopes).select2()
				$('#addPortfolioModal').modal('show')
				$('#savePortfolio').removeAttr('disabled');
			})

			// 新增/修改投资组合表单验证初始化
			$('#addPortfolioForm').validator({
				custom: {
					validfloatforplus: util.form.validator.validfloatforplus,
					validint: util.form.validator.validint,
					validpercentage: validpercentage
				},
				errors: {
					validfloatforplus: '数据格式不正确',
					validint: '数据格式不正确',
					validpercentage: '银行存款、现金类标的、非现金类标的三者比例总和不能超过100%'
				}
			})
			$('#editPortfolioForm').validator({
					custom: {
						validfloatforplus: util.form.validator.validfloatforplus,
						validint: util.form.validator.validint,
						validpercentage: validpercentage
					},
					errors: {
						validfloatforplus: '数据格式不正确',
						validint: '数据格式不正确',
						validpercentage: '银行存款、现金类标的、非现金类标的三者比例总和不能超过100%'
					}
				})
				// 新增投资组合 - 确定按钮点击事件
			$('#savePortfolio').on('click', function() {
					if(!$('#addPortfolioForm').validator('doSubmitCheck')) return
					$('#savePortfolio').attr('disabled', true);
					$('#addPortfolioForm').ajaxSubmit({
						url: config.api.portfolio.createPortfolio,
						success: function() {
							util.form.reset($('#addPortfolioForm'))
							$('#savePortfolio').attr('disabled', false);
							$('#portfolioApplyTable').bootstrapTable('refresh');
							$('#addPortfolioModal').modal('hide');
						}
					});
				});
				// 编辑投资组合 - 确定按钮点击事件
			$('#editPortfolio').on('click', function() {
					if(!$('#editPortfolioForm').validator('doSubmitCheck')) return
					$('#editPortfolio').attr('disabled', true);
					$('#editPortfolioForm').ajaxSubmit({
						url: config.api.portfolio.editPortfolio,
						success: function() {
							util.form.reset($('#editPortfolioForm'))
							$('#portfolioApplyTable').bootstrapTable('refresh');
							$('#editPortfolioModal').modal('hide')
						}
					});
					$('#editPortfolio').attr('disabled', false);
				})
				// 缓存当前操作数据
			var currentPool = null
				// 审核 - 不通过按钮点击事件
			$('#doUnAuditPortfolio').on('click', function() {
					http.post(config.api.portfolio.auditPortfolio, {
						data: {
							oid: currentPool.oid,
							operation: 'no'
						},
						contentType: 'form'
					}, function() {
						$('#portfolioApplyTable').bootstrapTable('refresh');
						$('#auditAssetPoolModal').modal('hide')
					})
				})
//				// 审核 - 通过按钮点击事件
//			$('#doAuditPortfolio').on('click', function() {
//					http.post(config.api.portfolio.auditPortfolio, {
//						data: {
//							oid: currentPool.oid,
//							operation: 'yes'
//						},
//						contentType: 'form'
//					}, function() {
//						$('#portfolioApplyTable').bootstrapTable('refresh');
//						$('#auditAssetPoolModal').modal('hide')
//					})
//				})
//				// 新增计提费率弹窗
//			$('#feeAdd').on('click', function() {
//					util.form.reset($(document.addFeeForm))
//					$('#addFeeModal').modal('show')
//				})
//				// 新增计提费率
//			$('#doAddFee').on('click', function() {
//					var form = document.addFeeForm
//					if(!$(form).validator('doSubmitCheck')) return
//					var formdata = {
//						startAmount: parseFloat(form.startAmount.value),
//						endAmount: form.endAmount.value ? parseFloat(form.endAmount.value) : undefined,
//						feeRatio: parseFloat(form.feeRatio.value)
//					}
//					var tableData = $('#settingTable').bootstrapTable('getData')
//					tableData.push(formdata)
//					$('#settingTable').bootstrapTable('load', tableData)
//					$('#addFeeModal').modal('hide')
//				})
//				// 保存投资组合计提费率
//			$('#doSaveSetting').on('click', function() {
//				http.post(config.api.duration.assetPool.saveSetting, {
//					data: JSON.stringify({
//						assetPoolOid: currentPool.oid,
//						feeSettings: $('#settingTable').bootstrapTable('getData')
//					})
//				}, function(rlt) {
//					$('#settingModal').modal('hide')
//				})
//			})

			function getQueryParams(val) {
				var form = document.searchForm
				$.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象
				pageOptions.rows = val.limit
				pageOptions.page = parseInt(val.offset / val.limit) + 1
				return val
			}
			// 自定义验证 - 现金比例/现金管理类工具比例/信托计划比例 加起来不能超过100
			function validpercentage($el) {
				var form = $el.closest('form')
				var parts = form.find('input[data-validpercentage]')
				var percentage = 0
				parts.each(function(index, item) {
					percentage += Number(item.value)
				})
				return !(percentage > 100)
			}

			/**
			 * 显示投资组合详情
			 * @param {Object} value
			 * @param {Object} row
			 */
			function toDetail(value, row) {
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
					$$.detailAutoFix($('#detportfolioForm'), data); // 自动填充详情
//					$$.formAutoFix($('#detportfolioForm'), data); // 自动填充表单
					$('#portfolioDetailModal').modal('show');
				})
			}

			/**
			 * 格式化数据
			 * 解析枚举值
			 * 单位换算成 万元
			 * 半分比换算成有 %
			 * @param {Object} result
			 */
			function resultDataFormat(result) {
				//      if (result.scale) {
				//          result.scale = formatUnitToWan(result.scale)
				//      }
				if(result.cashRate) {
					result.cashRate = formatPercent(result.cashRate)
				}
				if(result.liquidRate) {
					result.liquidRate = formatPercent(result.liquidRate)
				}
				if(result.illiquidRate) {
					result.illiquidRate = formatPercent(result.illiquidRate)
				}
				if(result.trusteeRate) {
					result.trusteeRate = formatPercent(result.trusteeRate)
				}
				if(result.manageRate) {
					result.manageRate = formatPercent(result.manageRate)
				}
				return result
			}

			/**
			 * 格式化数据（包含单位）
			 * 解析枚举值
			 * 单位换算成 万元
			 * 半分比换算成加 %
			 * @param {Object} result
			 */
			function resultDataFormatPlus(result) {
				if(result.scale) {
					result.scale = formatUnitToWan(result.scale) + '\t万元'
				}
				if(result.cashRate) {
					result.cashRate = formatPercent(result.cashRate) + '\t%'
				}
				if(result.liquidRate) {
					result.liquidRate = formatPercent(result.liquidRate) + '\t%'
				}
				if(result.illiquidRate) {
					result.illiquidRate = formatPercent(result.illiquidRate) + '\t%'
				}
				//      if (result.trusteeRate) {
				//          result.trusteeRate = formatPercent(result.trusteeRate) + '\t%'
				//      }
				if(result.manageRate) {
					result.manageRate = formatPercent(result.manageRate) + '\t%'
				}
				return result
			}

			/**
			 * 格式化单位为（万元）
			 * @param {Object} val
			 */
			function formatUnitToWan(val) {
				if(val) {
					val = parseFloat(val)
					return util.safeCalc(val, '/', 10000, 6)
				} else {
					return 0
				}
			}

			/**
			 * 格式化以千分位展示
			 * @param {Object} val
			 */
			function formatNumber(val) {
				if(val) {
					val = formatUnitToWan(val)
					return $.number(val, 6)
				} else {
					return 0
				}
			}

			/**
			 * 格式化单位为（万元）
			 * 以千分位展示
			 * @param {Object} val
			 */
			function formatPercent(val) {
				if(val) {
					val = parseFloat(val)
					return util.safeCalc(val, '*', 100, 4)
				} else {
					return '0'
				}
			}

			function formatScopes(val) {
				$.each(val, function(k, v) {
					$.each(v, function(o) {
						$('<div>' + v[o] + '</div>')
					});
				})
			}

			// 新增投资组合按钮点击事件
			function getSPVList(http, config) {
				http.post(config.api.portfolio.getAllSPV, {
					contentType: 'form'
				}, function(json) {
					var result = json.result
					var SPVSelectOptions = ''
					if(result) {
						result.forEach(function(item) {
							SPVSelectOptions += '<option value="' + item.spvId + '">' + item.spvName + '</option>'
						})
						$('#addSPV').html(SPVSelectOptions)
						$('#editSPV').html(SPVSelectOptions)
					}
				})
			}
			
		}
	}
})



