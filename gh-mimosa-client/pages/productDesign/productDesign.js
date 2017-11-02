/**
 * 产品申请管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'productDesign',
		init: function() {
			// js逻辑写在这里
			/**
			 * 数据表格分页、搜索条件配置
			 */
			var pageOptions = {
				number: 1,
				size: 10,
				name: '',
				type: ''
			}

			/**
			 * 用于存储表格checkbox选中的项
			 */
			var checkItems = []

			var selectProductOid = ""
			var setDate = getCurentDate()

			function getCurentDate() {
				var now = new Date();
				var year = now.getFullYear(); //年
				var month = now.getMonth() + 1; //月
				var day = now.getDate(); //日
				var clock = year + "-";
				if(month < 10) {
					clock += "0";
				}
				clock += month + "-";

				if(day < 10) {
					clock += "0";
				}
				clock += day;
				return(clock);
			}
			/**
			 * 设置奖励收益表格数据源
			 */
			var addProductRewards = []

			$(document.addProductForm.expandProductLabels).select2()
			$(document.updateProductForm.expandProductLabels).select2()

			/**
			 * 数据表格配置
			 */
			var tableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.productApplyList, {
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
					checkbox: true,
					align: 'center'
				}, {
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return(pageOptions.number - 1) * pageOptions.size + index + 1
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
					formatter: function(val, row, index) {
						switch(val) {
							case 'CREATE':
								return '新建'
							case 'UPDATE':
								return '修改'
							case 'AUDITING':
								return '审核中'
							case 'AUDITFAIL':
								return '审核不通过'
							case 'AUDITPASS':
								return '审核通过'
							case 'REVIEWFAIL':
								return '复核不通过'
							case 'REVIEWPASS':
								return '复核通过'
							case 'NOTSTARTRAISE':
								return '未开始募集'
							case 'RAISING':
								return '募集开始日期已到'
							case 'RAISEEND':
								return '募集结束日期已到'
							case 'NOTSTARTDURATION':
								return '存续期未开始'
							case 'DURATIONING':
								return '存续期开始日期已到'
							case 'DURATIONEND':
								return '存续期结束日期已到'
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
					field: 'createTime',
					align: 'right',
					formatter: function(val) {
						return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD')
					}
				}, {
					width: 256,
					align: 'center',
					formatter: function(val, row, index) {
						var buttons = [{
									text: '作废',
									type: 'button',
									class: 'item-invalid',
									isRender: true
								}
								, {
									text: '奖励收益设置',
									type: 'button',
									class: 'item-reward',
									isRender: row.typeOid == 'PRODUCTTYPE_02'
								}
								]
						var format = util.table.formatter.generateButton(buttons, 'productDesignTable');
						format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
						return format
					},
					events: {
						'click .item-update': function(e, value, row) {
							$('#updateProductForm').validator('destroy')

							$(document.updateProductForm.expandProductLabels).select2()

							http.post(config.api.productDetail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								if(result.errorCode == 0) {
									var data = result;
									selectProductOid = data.oid
									setDate = getCurentDate()

									if(data.raiseStartDate != null && data.raiseStartDate != '') {
										setDate = data.raiseStartDate
									} else {
										data.raiseStartDate = setDate
									}
									if(data.setupDate != null && data.setupDate != '') {
										setDate = data.setupDate
									} else {
										data.setupDate = setDate
									}

									$(document.updateProductForm.name).attr("data-fetch-id", data.oid)
									$(document.updateProductForm.fullName).attr("data-fetch-id", data.oid)
									$(document.updateProductForm.code).attr("data-fetch-id", data.oid)
//									if(data.expArorSec == data.expAror) {
//										data.expArorSec = null;
//									}
									$$.formAutoFix($('#updateProductForm'), data); // 自动填充表单

									if('PRODUCTTYPE_01' == data.typeOid) {
										if('MANUALINPUT' == data.raiseStartDateType) {
											$('#raiseStartDateType').removeClass('col-sm-4').addClass('col-sm-2')
											$('#raiseStartDateType').next('.col-sm-2').show()
										} else if('FIRSTRACKTIME' == data.raiseStartDateType) {
											$('#raiseStartDateType').removeClass('col-sm-2').addClass('col-sm-4')
											$('#raiseStartDateType').next('.col-sm-2').hide()
										}

										if('MANUAL' == data.raiseFullFoundType) {
											$('#raiseFullFoundType').next('.col-sm-4').hide()
										} else if('AUTO' == data.raiseFullFoundType) {
											$('#raiseFullFoundType').next('.col-sm-4').show()
										}

										$('#updateProductType01Area').show()
										$('#updateProductType02Area').hide()
										$('#updateProductType02Area_2').hide()
										$('#updateProductType02Area_3').hide()

										$('#updateProductType01Area').show().find('input').attr('disabled', false)
										$('#updateProductType02Area').hide().find('input').attr('disabled', 'disabled')
										$('#updateProductType02Area_2').hide().find('input').attr('disabled', 'disabled')
										$('#updateProductType02Area_3').hide().find('input').attr('disabled', 'disabled')
										$('#updateProductType01Area_1').find('select').attr('disabled', 'disabled')

									} else if('PRODUCTTYPE_02' == data.typeOid) {
										if('MANUALINPUT' == data.setupDateType) {
											$('#setupDateType').removeClass('col-sm-4').addClass('col-sm-2')
											$('#setupDateType').next('.col-sm-2').show()
										} else if('FIRSTRACKTIME' == data.setupDateType) {
											$('#setupDateType').removeClass('col-sm-2').addClass('col-sm-4')
											$('#setupDateType').next('.col-sm-2').hide()
										}
										$('#updateProductType02Area').show()
										$('#updateProductType02Area_2').show()
										$('#updateProductType02Area_3').show()
										$('#updateProductType01Area').hide()

										$('#updateProductType02Area').show().find('input').attr('disabled', false)
										$('#updateProductType02Area_2').show().find('input').attr('disabled', false)
										$('#updateProductType02Area_3').show().find('input').attr('disabled', false)
										$('#updateProductType01Area').hide().find('input').attr('disabled', 'disabled')
									}

									updateInvestUploadFiles = []
									if(data.investFiles != null && data.investFiles.length > 0) {
										for(var i = 0; i < data.investFiles.length; i++) {
											updateInvestUploadFiles.push(data.investFiles[i])
										}
									}
									$('#updateInvestUploadTable').bootstrapTable('load', updateInvestUploadFiles)

									updateServiceUploadFiles = []
									if(data.serviceFiles != null && data.serviceFiles.length > 0) {
										for(var i = 0; i < data.serviceFiles.length; i++) {
											updateServiceUploadFiles.push(data.serviceFiles[i])
										}
									}
									$('#updateServiceUploadTable').bootstrapTable('load', updateServiceUploadFiles)

									updateProductUploadFiles = []
									if(data.files != null && data.files.length > 0) {
										for(var i = 0; i < data.files.length; i++) {
											updateProductUploadFiles.push(data.files[i])
										}
									}
									$('#updateProductUploadTable').bootstrapTable('load', updateProductUploadFiles)

									http.post(config.api.system.productLabel.getProductLabelNames, {
										data: {
											labelType: 'general'
										},
										contentType: 'form'
									}, function(result) {
										var select = document.updateProductForm.basicProductLabel
										$(select).empty()
										result.rows.forEach(function(item, index) {
											$(select).append('<option value="' + item.oid + '" data-code="' + item.code + '">' + item.name + '</option>')
										})
										select.value = data.basicProductLabelOid
										
										formatBasicProductLabel(document.updateProductForm, select);
										$(select).on('change', function(){
											formatBasicProductLabel(document.updateProductForm, select);
										})
									})

									http.post(config.api.system.productLabel.getProductLabelNames, {
										data: {
											labelType: 'extend'
										},
										contentType: 'form'
									}, function(result) {
										var select = document.updateProductForm.expandProductLabels
										$(select).empty()
										result.rows.forEach(function(item, index) {
											$(select).append('<option value="' + item.oid + '">' + item.name + '</option>')
										})
										$(document.updateProductForm.expandProductLabels).val(data.expandProductLabelOids).trigger('change')
									})

									util.form.validator.init($('#updateProductForm'))
									$('#updateProductModal').modal('show');

									http.post(config.api.product.apply.getOptionalAssetPoolNames, {
										data: {
											productOid: data.oid
										},
										contentType: 'form'
									}, function(result) {
										var select = document.updateProductForm.assetPoolOid
										$(select).empty()
										result.rows.forEach(function(item, index) {
											$(select).append('<option value="' + item.oid + '">' + item.name + '</option>')
										})
										select.value = data.assetPoolOid

										if(result.rows.length > 0 && data.assetPoolOid !== null) {
											http.post(
												config.api.portfolio.getPortfolioByOid, {
													data: {
														oid: data.assetPoolOid
													},
													contentType: 'form',
												},
												function(rlt) {
													if(rlt.errorCode == 0 && rlt.result != null) {
														document.updateProductForm.spvName.value = rlt.result.spvName

														http.post(config.api.product.apply.getHoldByAssetPoolOid, {
															data: {
																assetPoolOid: rlt.result.oid
															},
															contentType: 'form',
														}, function(r) {
															if(r.errorCode == 0 && r != null) {
																document.updateProductForm.totalHoldVolume.value = r.totalHoldVolume
															} else {
																document.updateProductForm.totalHoldVolume.value = ''
															}

														})

													} else {
														document.updateProductForm.spvName.value = ''
													}
												}
											)
										}

									})

								} else {
									alert(查询失败);
								}
							})
						},
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html("确定作废产品名称为:")
							$("#confirmTitle1").html(row.fullName + "的产品吗？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.productInvalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#productDesignTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-reward': function(e, value, row) {
							selectProductOid = row.oid
							http.post(
								config.api.productRewardList, {
									data: {
										productOid: row.oid
									},
									contentType: 'form'
								},
								function(result) {
									if(result.errorCode == 0) {
										var data = result.rows;
										addProductRewards = []
										result.rows.forEach(function(item, index) {
											addProductRewards.push(item)
										})
										if($("#productRewardName").children().length > 0) {
											$("#productRewardName").children().remove()
										}

										var toh4 = generateHeader(row.name)

										function generateHeader(title) {
											return $('<h4 class=" modal-title">' + title + '--奖励收益列表' + '</h4>')
										}

										$("#productRewardName").append(toh4)

										$('#addProductRewardTable').bootstrapTable('load', data)
										$('#productRewardModal').modal('show');
									} else {
										alert(查询失败);
									}
								}
							)
						}
					}
				}],

				/**
				 * 单选按钮选中一项时
				 * @param {Object} row
				 */
				onCheck: function(row) {
					var indexOf = -1
					if(checkItems.length > 0) {
						checkItems.forEach(function(item, index) {
							if(item.oid == row.oid) {
								indexOf = index
							}
						})
					}
					if(indexOf < 0) {
						checkItems.push(row)
					}
				},

				/**
				 * 单选按钮取消一项时
				 * @param {Object} row
				 */
				onUncheck: function(row) {
					checkItems.splice(checkItems.indexOf(row), 1)
				},

				/**
				 * 全选按钮选中时
				 * @param {Object} rows
				 */
				onCheckAll: function(rows) {
					checkItems = rows.map(function(item) {
						return item
					})
				},

				/**
				 * 全选按钮取消时
				 */
				onUncheckAll: function() {
					checkItems = []
				}
			}

			/**
			 * 数据表格初始化
			 */
			$('#productDesignTable').bootstrapTable(tableConfig)

			/**
			 * 搜索表单初始化
			 */
			$$.searchInit($('#searchForm'), $('#productDesignTable'))

			/**
			 * 奖励收益设置表单验证初始化
			 */
			util.form.validator.init($('#addProductRewardForm'))
			util.form.validator.init($('#saveProductRewardForm'))

			/**
			 * 额外增信radio change事件
			 */
			$(document.addProductForm.reveal).on('ifChecked', function() {
				if(this.value === 'YES') {
					$('#addRevealComment').show()
				} else {
					$('#addRevealComment').hide()
				}
			})

			/**
			 * 额外增信radio change事件
			 */
			$(document.updateProductForm.reveal).on('ifChecked', function() {
				if(this.value === 'YES') {
					$('#updateRevealComment').show()
				} else {
					$('#updateRevealComment').hide()
				}
			})
			
			/**
			 * 赎回占比开关radio change事件
			 */
			$('#addProductType02Area').find('input[name=isPreviousCurVolume]').on('ifChecked', function() {
				if(this.value === 'YES') {
					$('#addPreviousCurVolumePercent').show().find('input[name=previousCurVolumePercent]').attr('required','required')
				} else {
					$('#addPreviousCurVolumePercent').hide().find('input[name=previousCurVolumePercent]').val('').removeAttr('required')
					$('#addPreviousCurVolumePercentDiv').removeClass("has-error")
					$('#addPreviousCurVolumePercentError').html('')
				}
				$('#addProductForm').validator('destroy')
				util.form.validator.init($('#addProductForm'))
			})

			/**
			 * 赎回占比开关radio change事件
			 */
			$('#updateProductType02Area').find('input[name=isPreviousCurVolume]').on('ifChecked', function() {
				if(this.value === 'YES') {
					$('#updatePreviousCurVolumePercent').show().find('input[name=previousCurVolumePercent]').attr('required','required')
				} else {
					$('#updatePreviousCurVolumePercent').hide().find('input[name=previousCurVolumePercent]').val('').removeAttr('required')
					$('#updatePreviousCurVolumePercentDiv').removeClass("has-error")
					$('#updatePreviousCurVolumePercentError').html('')
				}
				$('#updateProductForm').validator('destroy')
				util.form.validator.init($('#updateProductForm'))
			})

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
					align: 'right'
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
							location.href = row.furl + '?realname=' + row.name
						}
					}
				}]
			}

			/**
			 * 详情定向委托投资管理协议表格初始化
			 */
			$('#productDetailInvestFileTable').bootstrapTable(productDetailInvestFileTableConfig)

			/**
			 * 详情风险提示书表格配置
			 */
			var productDetailServiceFileTableConfig = {
				columns: [{
					field: 'name',
				}, {
					field: 'operator',
				}, {
					field: 'createTime',
					align: 'right'
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
							location.href = row.furl + '?realname=' + row.name
						}
					}
				}]
			}

			/**
			 * 详情风险提示书表格初始化
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
					align: 'right'
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
							location.href = row.furl + '?realname=' + row.name
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

			/**
			 * 设置奖励收益表格初始化
			 */
			$('#productRewardTable').bootstrapTable(productRewardTableConfig)

			/**
			 * 产品类型下拉菜单关联区域显隐
			 * input disabled 设置为 disabled的时候将不做验证
			 */
			$('#addProductTypeSelect').on('change', function() {
				/**
				 * 重置验证逻辑
				 */
				$('#addProductForm').validator('destroy')

				switch(this.value) {
					case 'PRODUCTTYPE_01':
						$('#addProductType01Area').show().find('input').attr('disabled', false)
						$('#addProductType02Area').hide().find('input').attr('disabled', 'disabled')
						$('#addProductType02Area_2').hide().find('input').attr('disabled', 'disabled')
						$('#addProductType02Area_3').hide().find('input').attr('disabled', 'disabled')
						$('#addProductType01Area_1').find('select').val('D').attr('disabled', 'disabled')
						break
					case 'PRODUCTTYPE_02':
						$('#addProductType01Area').hide().find('input').attr('disabled', 'disabled')
						$('#addProductType02Area').show().find('input').attr('disabled', false)
						$('#addProductType02Area_2').show().find('input').attr('disabled', false)
						$('#addProductType02Area_3').show().find('input').attr('disabled', false)
						$('#addProductType01Area_1').find('select').attr('disabled', false)
						break
				}
				util.form.validator.init($('#addProductForm'))
			})

			$('#updateProductTypeSelect').on('change', function() {
				switch(this.value) {
					case 'PRODUCTTYPE_01':
						$('#updateProductType01Area').show().find('input').attr('disabled', false)
						$('#updateProductType02Area').hide().find('input').attr('disabled', 'disabled')
						$('#updateProductType02Area_2').hide().find('input').attr('disabled', 'disabled')
						$('#updateProductType02Area_3').hide().find('input').attr('disabled', 'disabled')
						break
					case 'PRODUCTTYPE_02':
						$('#updateProductType02Area').show().find('input').attr('disabled', false)
						$('#updateProductType02Area_2').show().find('input').attr('disabled', false)
						$('#updateProductType02Area_3').show().find('input').attr('disabled', false)
						$('#updateProductType01Area').hide().find('input').attr('disabled', 'disabled')
						break
				}

				/**
				 * 重置验证逻辑
				 */
				$('#updateProductForm').validator('destroy')
				util.form.validator.init($('#updateProductForm'))
			})

			/**
			 * 募集开始时间&成立时间select联动 
			 */
			$('select[name=raiseStartDateType],select[name=setupDateType]').on('change', function() {
				var col = $(this).parent().parent()
				switch(this.value) {
					case 'FIRSTRACKTIME':
						col.removeClass('col-sm-2').addClass('col-sm-4')
						col.next('.col-sm-2').hide()
						if(selectProductOid == '') {
							$('#addRaiseStartDate').val(setDate)
							$('#addSetupDate').val(setDate)
						}
						break
					case 'MANUALINPUT':
						col.removeClass('col-sm-4').addClass('col-sm-2')
						col.next('.col-sm-2').show()
						if(selectProductOid == '') {
							$('#addRaiseStartDate').val('')
							$('#addSetupDate').val('')
						}
						break
				}

				if(selectProductOid === '') {
					$('#addProductForm').validator('destroy')
					util.form.validator.init($('#addProductForm'))
				} else {
					$('#updateProductForm').validator('destroy')
					util.form.validator.init($('#updateProductForm'))
				}

			}).change()

			/**
			 * 募集满额后是否自动触发成立select联动 
			 */
			$('select[name=raiseFullFoundType]').on('change', function() {
				var col = $(this).parent().parent()
				switch(this.value) {
					case 'MANUAL':
						col.next('.col-sm-4').hide()
						col.next('.col-sm-4').find('input[name=autoFoundDays]').removeAttr("required")
						break
					case 'AUTO':
						col.next('.col-sm-4').show()
						col.next('.col-sm-4').find('input[name=autoFoundDays]').attr("required", "required")
						break
				}

			}).change()

			/**
			 * 确认日input后缀按钮联动
			 */
			$('.select-button').find('li a').on('click', function() {
				var ul = $(this).parent().parent()
				ul.prev('button').html(this.innerText + ' <span class="fa fa-caret-down"></span>')
				ul.next('input').val($(this).attr('value'))
			})

			/**
			 * 新加产品 资产池选择改变事件
			 */
			$('#addAssetPoolOid').on('change', function() {
				if(this.value != '') {
					http.post(config.api.portfolio.getPortfolioByOid, {
						data: {
							oid: this.value
						},
						contentType: 'form',
					}, function(rlt) {
						console.log(rlt)
						if(rlt.errorCode == 0 && rlt.result != null) {
							document.addProductForm.spvName.value = rlt.result.spvName

							http.post(config.api.product.apply.getHoldByAssetPoolOid, {
								data: {
									assetPoolOid: rlt.result.oid
								},
								contentType: 'form',
							}, function(r) {
								if(r.errorCode == 0 && r != null) {
									document.addProductForm.totalHoldVolume.value = r.totalHoldVolume
								} else {
									document.addProductForm.totalHoldVolume.value = ''
								}

							})

						} else {
							document.addProductForm.spvName.value = ''
						}

					})
				}
			})

			/**
			 * 编辑产品 资产池选择改变事件
			 */
			$('#updateAssetPoolOid').on('change', function() {
				if(this.value != '') {
					http.post(config.api.portfolio.getPortfolioByOid, {
						data: {
							oid: this.value
						},
						contentType: 'form',
					}, function(rlt) {
						if(rlt.errorCode == 0 && rlt.result != null) {
							document.updateProductForm.spvName.value = rlt.result.spvName

							http.post(config.api.product.apply.getHoldByAssetPoolOid, {
								data: {
									assetPoolOid: rlt.result.oid
								},
								contentType: 'form',
							}, function(r) {
								if(r.errorCode == 0 && r != null) {
									document.updateProductForm.totalHoldVolume.value = r.totalHoldVolume
								} else {
									document.updateProductForm.totalHoldVolume.value = ''
								}

							})

						} else {
							document.updateProductForm.spvName.value = ''
						}

					})
				}
			})

			//校验预期年化收益率开始值不能大于预期年化收益率结束值
			$(document.addProductForm.expAror).on('input', function() {
				var flag = true
				$('#addExpArorDiv').removeClass("has-error")
				$('#addExpArorSecDiv').removeClass("has-error")
				$('#addExpArorError').html('')
				$('#addExpArorSecError').html('')

				var expAror = parseFloat(this.value) || 0
				var expArorSecStr = document.addProductForm.expArorSec.value
				
				if(!expAror){
					$('#addExpArorError').html('预期年化收益率只能为前4位后2位小数')
					$('#addExpArorDiv').addClass("has-error")
					flag = false
				}

				if(expArorSecStr != null && expArorSecStr != '') { //结束值有填写
					var expArorSec = parseFloat(expArorSecStr) || 0
					if(expAror > expArorSec) {
						$('#addExpArorError').html('年化收益率开始值不能大于结束值')
						$('#addExpArorDiv').addClass("has-error")
						flag = false
					}
				}

				return flag
			})

			//校验预期年化收益率结束值不能小于预期年化收益率开始值
			$(document.addProductForm.expArorSec).on('input', function() {
				var flag = true
				$('#addExpArorDiv').removeClass("has-error")
				$('#addExpArorSecDiv').removeClass("has-error")
				$('#addExpArorError').html('')
				$('#addExpArorSecError').html('')

				var expAror = parseFloat(document.addProductForm.expAror.value) || 0
				var expArorSecStr = this.value
				
				if(!expAror){
					$('#addExpArorError').html('预期年化收益率只能为前4位后2位小数')
					$('#addExpArorDiv').addClass("has-error")
					flag = false
				}
				
				if(expArorSecStr != null && expArorSecStr != '') { //结束值有填写
					var expArorSec = parseFloat(expArorSecStr) || 0
					if(expAror > expArorSec) {
						$('#addExpArorSecError').html('预期年化收益率结束值不能小于开始值')
						$('#addExpArorSecDiv').addClass("has-error")
						flag = false
					}
				}

				return flag

			})
			
			//校验认购确认日不大于募集期满后最晚成立日
			$(document.addProductForm.subscribeConfirmDays).on('input', function() {
				var flag = true
				$('#addSubscribeConfirmDaysDiv').removeClass("has-error")
				$('#addFoundDaysDiv').removeClass("has-error")
				$('#addSubscribeConfirmDaysError').html('')
				$('#addFoundDaysError').html('')

				var subscribeConfirmDays = parseInt(this.value) || 0
				var foundDays = parseInt(document.addProductForm.foundDays.value) || 0

				if(foundDays === 0) {
					$('#addFoundDaysError').html('应该小于240大于0的整数')
					$('#addFoundDaysDiv').addClass("has-error")
					flag = false
				} else if(foundDays > 0 && subscribeConfirmDays > foundDays) {
					$('#addSubscribeConfirmDaysError').html('认购确认日必须小于等于募集期满后最晚成立日')
					$('#addSubscribeConfirmDaysDiv').addClass("has-error")
					flag = false
				}
				return flag
			})
			
			//校验募集期满后最晚成立日不小于认购确认日
			$(document.addProductForm.foundDays).on('input', function() {
				var flag = true
				$('#addSubscribeConfirmDaysDiv').removeClass("has-error")
				$('#addFoundDaysDiv').removeClass("has-error")
				$('#addSubscribeConfirmDaysError').html('')
				$('#addFoundDaysError').html('')

				var subscribeConfirmDays = parseInt(document.addProductForm.subscribeConfirmDays.value) || 0
				var foundDays = parseInt(this.value) || 0

				if(subscribeConfirmDays > foundDays) {
					$('#addFoundDaysError').html('募集期满后最晚成立日必须大于等于认购确认日')
					$('#addFoundDaysDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			//校验单笔投资最低份额不能大于单笔投资最高份额
			$(document.addProductForm.investMin).on('input', function() {
				var flag = true
				$('#addInvestMinDiv').removeClass("has-error")
				$('#addInvestMaxDiv').removeClass("has-error")
				$('#addInvestMinError').html('')
				$('#addInvestMaxError').html('')

				var investMinStr = this.value
				var investMaxStr = document.addProductForm.investMax.value

				if(investMinStr != null && investMinStr != '' && investMaxStr != null && investMaxStr != '') { //都有填写
					var investMin = parseFloat(investMinStr) || 0
					var investMax = parseFloat(investMaxStr) || 0
					if(investMin > investMax) {
						$('#addInvestMinError').html('单笔投资最低份额不能大于单笔投资最高份额')
						$('#addInvestMinDiv').addClass("has-error")
						flag = false
					}
				}

				return flag
			})

			//校验单笔投资最高份额不能小于单笔投资最低份额
			$(document.addProductForm.investMax).on('input', function() {
				var flag = true
				$('#addInvestMinDiv').removeClass("has-error")
				$('#addInvestMaxDiv').removeClass("has-error")
				$('#addInvestMinError').html('')
				$('#addInvestMaxError').html('')

				var investMaxStr = this.value
				var investMinStr = document.addProductForm.investMin.value

				if(investMinStr != null && investMinStr != '' && investMaxStr != null && investMaxStr != '') { //都有填写
					var investMin = parseFloat(investMinStr) || 0
					var investMax = parseFloat(investMaxStr) || 0
					if(investMin > investMax) {
						$('#addInvestMaxError').html('单笔投资最高份额不能小于单笔投资最低份额')
						$('#addInvestMaxDiv').addClass("has-error")
						flag = false
					}
				}
				return flag

			})

			//校验单笔赎回最低份额 必须小于单人单日赎回上限 并且小于单笔赎回最高份额
			$(document.addProductForm.minRredeem).on('input', function() {
				var flag = true
				$('#addMinRredeemDiv').removeClass("has-error")
				$('#addMaxRredeemDiv').removeClass("has-error")
				$('#addSingleDailyMaxRedeemDiv').removeClass("has-error")
				$('#addMinRredeemError').html('')
				$('#addMaxRredeemError').html('')
				$('#addSingleDailyMaxRedeemError').html('')

				var minRredeemStr = this.value
				var maxRredeemStr = document.addProductForm.maxRredeem.value
				var singleDailyMaxRedeemStr = document.addProductForm.singleDailyMaxRedeem.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var maxRredeem = parseFloat(maxRredeemStr) || 0
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && maxRredeemStr != null && maxRredeemStr != '') { //都有填写
					if(minRredeem > maxRredeem) {
						$('#addMinRredeemError').html('单笔赎回最低份额不能大于单笔赎回最高份额')
						$('#addMinRredeemDiv').addClass("has-error")
						flag = false
						return flag
					}
				}
				if(minRredeemStr != null && minRredeemStr != '' && singleDailyMaxRedeemStr != null && singleDailyMaxRedeemStr != '') { //都有填写
					if(minRredeem > singleDailyMaxRedeem) {
						$('#addMinRredeemError').html('单笔赎回最低份额不能大于单人单日赎回上限')
						$('#addMinRredeemDiv').addClass("has-error")
						flag = false
						return flag
					}
				}
				return flag
			})

			//校验单笔赎回最高份额 必须大于单笔赎回最低份额
			$(document.addProductForm.maxRredeem).on('input', function() {
				var flag = true
				$('#addMinRredeemDiv').removeClass("has-error")
				$('#addMaxRredeemDiv').removeClass("has-error")
				$('#addMinRredeemError').html('')
				$('#addMaxRredeemError').html('')

				var maxRredeemStr = this.value
				var minRredeemStr = document.addProductForm.minRredeem.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var maxRredeem = parseFloat(maxRredeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && maxRredeemStr != null && maxRredeemStr != '') { //都有填写
					if(minRredeem > maxRredeem) {
						$('#addMaxRredeemError').html('单笔赎回最高份额不能小于单笔赎回最低份额')
						$('#addMaxRredeemDiv').addClass("has-error")
						flag = false
					}
				}
				return flag
			})

			//校验单人单日赎回上限必须大于单笔赎回最低份额 
			$(document.addProductForm.singleDailyMaxRedeem).on('input', function() {
				var flag = true
				$('#addMinRredeemDiv').removeClass("has-error")
				$('#addSingleDailyMaxRedeemDiv').removeClass("has-error")
				$('#addMinRredeemError').html('')
				$('#addSingleDailyMaxRedeemError').html('')

				var minRredeemStr = document.addProductForm.minRredeem.value
				var singleDailyMaxRedeemStr = this.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && singleDailyMaxRedeemStr != null && singleDailyMaxRedeemStr != '') { //都有填写
					if(minRredeem > singleDailyMaxRedeem) {
						$('#addSingleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
						$('#addSingleDailyMaxRedeemDiv').addClass("has-error")
						flag = false
					}
				}
				return flag

			})

			//校验起息日大于等于申购确认日
			$(document.addProductForm.purchaseConfirmDate).on('input', function() {
				var flag = true
				$('#addPurchaseConfirmDateDiv').removeClass("has-error")
				$('#addInterestsDateDiv').removeClass("has-error")
				$('#addPurchaseConfirmDateError').html('')
				$('#addInterestsDateError').html('')

				var purchaseConfirmDate = parseInt(this.value) || 0
				var interestsDate = parseInt(document.addProductForm.interestsDate.value) || 0

				if(interestsDate === 0) {
					$('#addInterestsDateError').html('应该大于等于1小于244')
					$('#addInterestsDateDiv').addClass("has-error")
					flag = false
				} else if(interestsDate > 0 && purchaseConfirmDate > interestsDate) {
					$('#addPurchaseConfirmDateError').html('申购确认日必须小于等于起息日')
					$('#addPurchaseConfirmDateDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			$(document.addProductForm.interestsDate).on('input', function() {
				var flag = true
				$('#addPurchaseConfirmDateDiv').removeClass("has-error")
				$('#addInterestsDateDiv').removeClass("has-error")
				$('#addPurchaseConfirmDateError').html('')
				$('#addInterestsDateError').html('')

				var interestsDate = parseInt(this.value) || 0
				var purchaseConfirmDate = parseInt(document.addProductForm.purchaseConfirmDate.value) || 0

				if(purchaseConfirmDate === 0) {
					$('#addPurchaseConfirmDateError').html('应该大于等于1小于244')
					$('#addPurchaseConfirmDateDiv').addClass("has-error")
					flag = false
				} else if(purchaseConfirmDate > 0 && interestsDate < purchaseConfirmDate) {
					$('#addInterestsDateError').html('起息日必须大于等于申购确认日')
					$('#addInterestsDateDiv').addClass("has-error")
					flag = false
				} else {
					$('#addPurchaseConfirmDateDiv').removeClass("has-error")
					$('#addInterestsDateDiv').removeClass("has-error")
					$('#addPurchaseConfirmDateError').html('')
					$('#addInterestsDateError').html('')
				}
//				if(interestsDate < purchaseConfirmDate) {
//					$('#addInterestsDateError').html('起息日必须大于等于申购确认日')
//					$('#addInterestsDateDiv').addClass("has-error")
//					flag = false
//				}
				return flag

			})

			//校验预期年化收益率开始值不能大于预期年化收益率结束值
			$(document.updateProductForm.expAror).on('input', function() {
				var flag = true
				$('#updateExpArorDiv').removeClass("has-error")
				$('#updateExpArorSecDiv').removeClass("has-error")
				$('#updateExpArorError').html('')
				$('#updateExpArorSecError').html('')

				var expAror = parseFloat(this.value) || 0
				var expArorSecStr = document.updateProductForm.expArorSec.value
				
				if(!expAror){
					$('#updateExpArorError').html('预期年化收益率只能为前4位后2位小数')
					$('#updateExpArorDiv').addClass("has-error")
					flag = false
				}

				if(expArorSecStr != null && expArorSecStr != '') { //结束值有填写
					var expArorSec = parseFloat(expArorSecStr) || 0
					if(expAror > expArorSec) {
						$('#updateExpArorError').html('年化收益率开始值不能大于结束值')
						$('#updateExpArorDiv').addClass("has-error")
						flag = false
					}
				}

				return flag
			})
			
			//校验认购确认日不大于募集期满后最晚成立日
			$(document.updateProductForm.subscribeConfirmDays).on('input', function() {
				var flag = true
				$('#updateSubscribeConfirmDaysDiv').removeClass("has-error")
				$('#updateFoundDaysDiv').removeClass("has-error")
				$('#updateSubscribeConfirmDaysError').html('')
				$('#updateFoundDaysError').html('')

				var subscribeConfirmDays = parseInt(this.value) || 0
				var foundDays = parseInt(document.updateProductForm.foundDays.value) || 0

				if(foundDays === 0) {
					$('#updateFoundDaysError').html('应该小于240大于0的整数')
					$('#updateFoundDaysDiv').addClass("has-error")
					flag = false
				} else if(foundDays > 0 && subscribeConfirmDays > foundDays) {
					$('#updateSubscribeConfirmDaysError').html('认购确认日必须小于等于募集期满后最晚成立日')
					$('#updateSubscribeConfirmDaysDiv').addClass("has-error")
					flag = false
				}
				return flag
			})
			
			//校验募集期满后最晚成立日不小于认购确认日
			$(document.updateProductForm.foundDays).on('input', function() {
				var flag = true
				$('#updateSubscribeConfirmDaysDiv').removeClass("has-error")
				$('#updateFoundDaysDiv').removeClass("has-error")
				$('#updateSubscribeConfirmDaysError').html('')
				$('#updateFoundDaysError').html('')

				var subscribeConfirmDays = parseInt(document.updateProductForm.subscribeConfirmDays.value) || 0
				var foundDays = parseInt(this.value) || 0

				if(subscribeConfirmDays > foundDays) {
					$('#updateFoundDaysError').html('募集期满后最晚成立日必须大于等于认购确认日')
					$('#updateFoundDaysDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			//校验预期年化收益率结束值不能小于预期年化收益率开始值
			$(document.updateProductForm.expArorSec).on('input', function() {
				var flag = true
				$('#updateExpArorDiv').removeClass("has-error")
				$('#updateExpArorSecDiv').removeClass("has-error")
				$('#updateExpArorError').html('')
				$('#updateExpArorSecError').html('')

				var expAror = parseFloat(document.updateProductForm.expAror.value) || 0
				var expArorSecStr = this.value
				
				if(!expAror){
					$('#updateExpArorError').html('预期年化收益率只能为前4位后2位小数')
					$('#updateExpArorDiv').addClass("has-error")
					flag = false
				}
				
				if(expArorSecStr != null && expArorSecStr != '') { //结束值有填写
					var expArorSec = parseFloat(expArorSecStr) || 0
					if(expAror > expArorSec) {
						$('#updateExpArorSecError').html('预期年化收益率结束值不能小于开始值')
						$('#updateExpArorSecDiv').addClass("has-error")
						flag = false
					}
				}

				return flag

			})

			//校验单笔投资最低份额不能大于单笔投资最高份额
			$(document.updateProductForm.investMin).on('input', function() {
				var flag = true
				$('#updateInvestMinDiv').removeClass("has-error")
				$('#updateInvestMaxDiv').removeClass("has-error")
				$('#updateInvestMinError').html('')
				$('#updateInvestMaxError').html('')

				var investMinStr = this.value
				var investMaxStr = document.updateProductForm.investMax.value

				if(investMinStr != null && investMinStr != '' && investMaxStr != null && investMaxStr != '') { //都有填写
					var investMin = parseFloat(investMinStr) || 0
					var investMax = parseFloat(investMaxStr) || 0
					if(investMin > investMax) {
						$('#updateInvestMinError').html('单笔投资最低份额不能大于单笔投资最高份额')
						$('#updateInvestMinDiv').addClass("has-error")
						flag = false
					}
				}

				return flag
			})

			//校验单笔投资最高份额不能小于单笔投资最低份额
			$(document.updateProductForm.investMax).on('input', function() {
				var flag = true
				$('#updateInvestMinDiv').removeClass("has-error")
				$('#updateInvestMaxDiv').removeClass("has-error")
				$('#updateInvestMinError').html('')
				$('#updateInvestMaxError').html('')

				var investMaxStr = this.value
				var investMinStr = document.updateProductForm.investMin.value

				if(investMinStr != null && investMinStr != '' && investMaxStr != null && investMaxStr != '') { //都有填写
					var investMin = parseFloat(investMinStr) || 0
					var investMax = parseFloat(investMaxStr) || 0
					if(investMin > investMax) {
						$('#updateInvestMaxError').html('单笔投资最高份额不能小于单笔投资最低份额')
						$('#updateInvestMaxDiv').addClass("has-error")
						flag = false
					}
				}
				return flag

			})

			//校验单笔赎回最低份额 必须小于单人单日赎回上限 并且小于单笔赎回最高份额
			$(document.updateProductForm.minRredeem).on('input', function() {
				var flag = true
				$('#updateMinRredeemDiv').removeClass("has-error")
				$('#updateMaxRredeemDiv').removeClass("has-error")
				$('#updateSingleDailyMaxRedeemDiv').removeClass("has-error")
				$('#updateMinRredeemError').html('')
				$('#updateMaxRredeemError').html('')
				$('#updateSingleDailyMaxRedeemError').html('')

				var minRredeemStr = this.value
				var maxRredeemStr = document.updateProductForm.maxRredeem.value
				var singleDailyMaxRedeemStr = document.updateProductForm.singleDailyMaxRedeem.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var maxRredeem = parseFloat(maxRredeemStr) || 0
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && maxRredeemStr != null && maxRredeemStr != '') { //都有填写
					if(minRredeem > maxRredeem) {
						$('#updateMinRredeemError').html('单笔赎回最低份额不能大于单笔赎回最高份额')
						$('#updateMinRredeemDiv').addClass("has-error")
						flag = false
						return flag
					}
				}
				if(minRredeemStr != null && minRredeemStr != '' && singleDailyMaxRedeemStr != null && singleDailyMaxRedeemStr != '') { //都有填写
					if(minRredeem > singleDailyMaxRedeem) {
						$('#updateMinRredeemError').html('单笔赎回最低份额不能大于单人单日赎回上限')
						$('#updateMinRredeemDiv').addClass("has-error")
						flag = false
						return flag
					}
				}
				return flag
			})

			//校验单笔赎回最高份额 必须大于单笔赎回最低份额
			$(document.updateProductForm.maxRredeem).on('input', function() {
				var flag = true
				$('#updateMinRredeemDiv').removeClass("has-error")
				$('#updateMaxRredeemDiv').removeClass("has-error")
				$('#updateMinRredeemError').html('')
				$('#updateMaxRredeemError').html('')

				var maxRredeemStr = this.value
				var minRredeemStr = document.updateProductForm.minRredeem.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var maxRredeem = parseFloat(maxRredeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && maxRredeemStr != null && maxRredeemStr != '') { //都有填写
					if(minRredeem > maxRredeem) {
						$('#updateMaxRredeemError').html('单笔赎回最高份额不能小于单笔赎回最低份额')
						$('#updateMaxRredeemDiv').addClass("has-error")
						flag = false
					}
				}
				return flag
			})

			//校验单人单日赎回上限必须大于单笔赎回最低份额 
			$(document.updateProductForm.singleDailyMaxRedeem).on('input', function() {
				var flag = true
				$('#updateMinRredeemDiv').removeClass("has-error")
				$('#updateSingleDailyMaxRedeemDiv').removeClass("has-error")
				$('#updateMinRredeemError').html('')
				$('#updateSingleDailyMaxRedeemError').html('')

				var minRredeemStr = document.updateProductForm.minRredeem.value
				var singleDailyMaxRedeemStr = this.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && singleDailyMaxRedeemStr != null && singleDailyMaxRedeemStr != '') { //都有填写
					if(minRredeem > singleDailyMaxRedeem) {
						$('#updateSingleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
						$('#updateSingleDailyMaxRedeemDiv').addClass("has-error")
						flag = false
					}
				}
				return flag

			})

			//校验交易结束时间大于等于交易开始时间
			$(document.addProductForm.dealStartTime).on('blur', function() {
				var flag = true
				$('#addDealStartTimeDiv').removeClass("has-error")
				$('#addDealEndTimeDiv').removeClass("has-error")
				$('#addDealStartTimeError').html('')
				$('#addDealEndTimeError').html('')

				var dealStartTime = parseInt(this.value.replace(/\:/g,'')) || 0
				var dealEndTime = parseInt(document.addProductForm.dealEndTime.value.replace(/\:/g,'')) || 0

				if(dealEndTime > 0 && dealStartTime > dealEndTime) {
					$('#addDealStartTimeError').html('交易开始时间必须小于交易结束时间')
					$('#addDealStartTimeDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			$(document.addProductForm.dealEndTime).on('blur', function() {
				var flag = true
				$('#addDealStartTimeDiv').removeClass("has-error")
				$('#addDealEndTimeDiv').removeClass("has-error")
				$('#addDealStartTimeError').html('')
				$('#addDealEndTimeError').html('')

				var dealEndTime = parseInt(this.value.replace(/\:/g,'')) || 0
				var dealStartTime = parseInt(document.addProductForm.dealStartTime.value.replace(/\:/g,'')) || 0

				if(dealStartTime > 0 && dealEndTime < dealStartTime) {
					$('#addDealEndTimeError').html('交易结束时间必须大于交易开始时间')
					$('#addDealEndTimeDiv').addClass("has-error")
					flag = false
				}
				return flag

			})

			//校验交易结束时间大于等于交易开始时间
			$(document.updateProductForm.dealStartTime).on('blur', function() {
				var flag = true
				$('#updateDealStartTimeDiv').removeClass("has-error")
				$('#updateDealEndTimeDiv').removeClass("has-error")
				$('#updateDealStartTimeError').html('')
				$('#updateDealEndTimeError').html('')

				var dealStartTime = parseInt(this.value.replace(/\:/g,'')) || 0
				var dealEndTime = parseInt(document.updateProductForm.dealEndTime.value.replace(/\:/g,'')) || 0

				if(dealEndTime > 0 && dealStartTime > dealEndTime) {
					$('#updateDealStartTimeError').html('交易开始时间必须小于交易结束时间')
					$('#updateDealStartTimeDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			$(document.updateProductForm.dealEndTime).on('blur', function() {
				var flag = true
				$('#updateDealStartTimeDiv').removeClass("has-error")
				$('#updateDealEndTimeDiv').removeClass("has-error")
				$('#updateDealStartTimeError').html('')
				$('#updateDealEndTimeError').html('')

				var dealEndTime = parseInt(this.value.replace(/\:/g,'')) || 0
				var dealStartTime = parseInt(document.updateProductForm.dealStartTime.value.replace(/\:/g,'')) || 0

				if(dealStartTime > 0 && dealEndTime < dealStartTime) {
					$('#updateDealEndTimeError').html('交易结束时间必须大于交易开始时间')
					$('#updateDealEndTimeDiv').addClass("has-error")
					flag = false
				}
				return flag

			})

			//校验起息日大于等于申购确认日
			$(document.updateProductForm.purchaseConfirmDate).on('input', function() {
				var flag = true
				$('#updatePurchaseConfirmDateDiv').removeClass("has-error")
				$('#updateInterestsDateDiv').removeClass("has-error")
				$('#updatePurchaseConfirmDateError').html('')
				$('#updateInterestsDateError').html('')

				var purchaseConfirmDate = parseInt(this.value) || 0
				var interestsDate = parseInt(document.updateProductForm.interestsDate.value) || 0

				if(interestsDate === 0) {
					$('#updateInterestsDateError').html('应该大于等于1小于244')
					$('#updateInterestsDateDiv').addClass("has-error")
					flag = false
				} else if(interestsDate > 0 && purchaseConfirmDate > interestsDate) {
					$('#updatePurchaseConfirmDateError').html('申购确认日必须小于等于起息日')
					$('#updatePurchaseConfirmDateDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			$(document.updateProductForm.interestsDate).on('input', function() {
				var flag = true
				$('#updatePurchaseConfirmDateDiv').removeClass("has-error")
				$('#updateInterestsDateDiv').removeClass("has-error")
				$('#updatePurchaseConfirmDateError').html('')
				$('#updateInterestsDateError').html('')

				var interestsDate = parseInt(this.value) || 0
				var purchaseConfirmDate = parseInt(document.updateProductForm.purchaseConfirmDate.value) || 0

				if(purchaseConfirmDate === 0) {
					$('#updatePurchaseConfirmDateError').html('应该大于等于1小于244')
					$('#updatePurchaseConfirmDateDiv').addClass("has-error")
					flag = false
				} else if(purchaseConfirmDate > 0 && interestsDate < purchaseConfirmDate) {
					$('#updateInterestsDateError').html('起息日必须大于等于申购确认日')
					$('#updateInterestsDateDiv').addClass("has-error")
					flag = false
				} else {
					$('#updatePurchaseConfirmDateDiv').removeClass("has-error")
					$('#updateInterestsDateDiv').removeClass("has-error")
					$('#updatePurchaseConfirmDateError').html('')
					$('#updateInterestsDateError').html('')
				}
//				if(interestsDate < purchaseConfirmDate) {
//					$('#updateInterestsDateError').html('起息日必须大于等于申购确认日')
//					$('#updateInterestsDateDiv').addClass("has-error")
//					flag = false
//				}
				return flag

			})

			$(document.addProductForm.addRaiseStartDate).datetimepicker({
				minDate: moment().add(1, 'days')
			})

			$(document.addProductForm.addSetupDate).datetimepicker({
				minDate: moment().add(1, 'days')
			})

			$(document.updateProductForm.updateRaiseStartDate).datetimepicker({
				minDate: moment().subtract(0, 'days')
			})

			$(document.updateProductForm.updateSetupDate).datetimepicker({
				minDate: moment().subtract(0, 'days')
			})

			/**
			 * 新建产品按钮点击事件
			 */
			$('#productAdd').on('click', function() {
				var form = document.addProductForm
				$(form).validator('destroy')

				$(document.addProductForm.expandProductLabels).select2()

				selectProductOid = ''
				setDate = getCurentDate()

				/**
				 * 新建产品上传附件表格数据源
				 */
				addProductUploadFiles = []
				$('#addProductUploadTable').bootstrapTable('load', addProductUploadFiles)

				/**
				 * 新建产品上传服务信息协议表格数据源
				 */
				addServiceUploadFiles = []
				$('#addServiceUploadTable').bootstrapTable('load', addServiceUploadFiles)

				/**
				 * 新建产品上传定向委托投资管理协议表格数据源
				 */
				addInvestUploadFiles = []
				$('#addInvestUploadTable').bootstrapTable('load', addInvestUploadFiles)

				http.post(config.api.system.productLabel.getProductLabelNames, {
					data: {
						labelType: 'general'
					},
					contentType: 'form'
				}, function(result) {
					var select = document.addProductForm.basicProductLabel
					$(select).empty()
					result.rows.forEach(function(item, index) {
						$(select).append('<option value="' + item.oid + '" data-code="' + item.code + '">' + item.name + '</option>')
					})
					
					formatBasicProductLabel(document.addProductForm, select);
					$(select).on('change', function(){
						formatBasicProductLabel(document.addProductForm, select);
					})
				})

				http.post(config.api.system.productLabel.getProductLabelNames, {
					data: {
						labelType: 'extend'
					},
					contentType: 'form'
				}, function(result) {
					var select = document.addProductForm.expandProductLabels
					$(select).empty()
					result.rows.forEach(function(item, index) {
						$(select).append('<option value="' + item.oid + '">' + item.name + '</option>')
					})
				})

				var select = document.addProductForm.assetPoolOid
				$(select).empty()

				http.post(config.api.product.apply.getOptionalAssetPoolNames, function(result) {
					var select = document.addProductForm.assetPoolOid
					$(select).empty()
					result.rows.forEach(function(item, index) {
						$(select).append('<option value="' + item.oid + '" ' + (!index ? 'checked' : '') + '>' + item.name + '</option>')
					})
					if(result.rows.length > 0) {
						http.post(
							config.api.portfolio.getPortfolioByOid, {
								data: {
									oid: result.rows[0].oid
								},
								contentType: 'form',
							},
							function(rlt) {
								if(rlt.errorCode == 0 && rlt.result != null) {
									document.addProductForm.spvName.value = rlt.result.spvName

									http.post(config.api.product.apply.getHoldByAssetPoolOid, {
										data: {
											assetPoolOid: rlt.result.oid
										},
										contentType: 'form',
									}, function(r) {
										if(r.errorCode == 0 && r != null) {
											document.addProductForm.totalHoldVolume.value = r.totalHoldVolume
										} else {
											document.addProductForm.totalHoldVolume.value = ''
										}

									})

								} else {
									document.addProductForm.spvName.value = ''
								}
							}
						)
					}

				})

				util.form.validator.init($(form));
				$('#addProductModal').modal('show')
			})

			/**
			 * 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			 * @param {Object} val
			 */
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.name = form.name.value.trim()
				pageOptions.type = form.type.value.trim()
				return val
			}

			/**
			 * 新建产品上传附件表格数据源
			 */
			var addProductUploadFiles = []

			/**
			 * 新建产品初始化上传附件插件，在success里将上传成功附件插入到表格中
			 */
			$$.uploader({
				container: $('#addProductUploader'),
				btnName: '上传定向委托投资管理交易说明书',
				success: function(file) {
					file.furl = file.url
					addProductUploadFiles.push(file)
					$('#addProductUploadTable').bootstrapTable('load', addProductUploadFiles)
				}
			})

			/**
			 * 新建产品附件表格配置
			 */
			var addProductUploadTableConfig = {
				columns: [{
					field: 'name',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'addProductUploadTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl + '?realname=' + row.name
						},
						'click .item-delete': function(e, value, row) {
							var index = addProductUploadFiles.indexOf(row)
							addProductUploadFiles.splice(index, 1)
							$('#addProductUploadTable').bootstrapTable('load', addProductUploadFiles)
						}
					}
				}]
			}

			/**
			 * 新建产品附件表格初始化
			 */
			$('#addProductUploadTable').bootstrapTable(addProductUploadTableConfig)

			/**
			 * 新建产品上传风险提示书附件表格数据源
			 */
			var addServiceUploadFiles = []

			/**
			 * 新建产品初始化上传风险提示书附件插件，在success里将上传成功附件插入到表格中
			 */
			$$.uploader({
				container: $('#serviceUploader'),
				btnName: '上传风险提示书',
				success: function(file) {
					file.furl = file.url
					addServiceUploadFiles = []
					addServiceUploadFiles.push(file)
					$('#addServiceUploadTable').bootstrapTable('load', addServiceUploadFiles)
				}
			})

			/**
			 * 新建产品风险提示书附件表格配置
			 */
			var addServiceUploadTableConfig = {
				columns: [{
					field: 'name',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'addServiceUploadTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl + '?realname=' + row.name
						},
						'click .item-delete': function(e, value, row) {
							var index = addServiceUploadFiles.indexOf(row)
							addServiceUploadFiles.splice(index, 1)
							$('#addServiceUploadTable').bootstrapTable('load', addServiceUploadFiles)
						}
					}
				}]
			}

			/**
			 * 新建产品风险提示书附件表格初始化
			 */
			$('#addServiceUploadTable').bootstrapTable(addServiceUploadTableConfig)

			/**
			 * 新建产品上传定向委托投资管理协议附件表格数据源
			 */
			var addInvestUploadFiles = []

			/**
			 * 新建产品初始化上传附件插件，在success里将上传成功附件插入到表格中
			 */
			$$.uploader({
				container: $('#investUploader'),
				btnName: '上传定向委托投资管理协议',
				success: function(file) {
					file.furl = file.url
					addInvestUploadFiles = []
					addInvestUploadFiles.push(file)
					$('#addInvestUploadTable').bootstrapTable('load', addInvestUploadFiles)
				}
			})

			/**
			 * 新建产品附件表格配置
			 */
			var addInvestUploadTableConfig = {
				columns: [{
					field: 'name',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'addInvestUploadTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl + '?realname=' + row.name
						},
						'click .item-delete': function(e, value, row) {
							var index = addInvestUploadFiles.indexOf(row)
							addInvestUploadFiles.splice(index, 1)
							$('#addInvestUploadTable').bootstrapTable('load', addInvestUploadFiles)
						}
					}
				}]
			}

			/**
			 * 新建产品附件表格初始化
			 */
			$('#addInvestUploadTable').bootstrapTable(addInvestUploadTableConfig)

			/**
			 * 新建产品“保存”按钮点击事件
			 */
			$('#addProductSubmit').on('click', function() {
				if(!$('#addProductForm').validator('doSubmitCheck')) return

				//校验预期年化收益率开始值不能大于预期年化收益率结束值
				var expAror = parseFloat(document.addProductForm.expAror.value) || 0
				var expArorSecStr = document.addProductForm.expArorSec.value

				if(expArorSecStr != null && expArorSecStr != '') { //结束值有填写
					var expArorSec = parseFloat(expArorSecStr) || 0
					
					if(!expAror){
						$('#addExpArorDiv').removeClass("has-error")
						$('#addExpArorSecDiv').removeClass("has-error")
						$('#addExpArorSecError').html('')
						$('#addExpArorError').html('')
						$('#addExpArorError').html('预期年化收益率只能为前4位后2位小数')
						$('#addExpArorDiv').addClass("has-error")
						return
					}
					
					if(expAror > expArorSec) {
						$('#addExpArorDiv').removeClass("has-error")
						$('#addExpArorSecDiv').removeClass("has-error")
						$('#addExpArorSecError').html('')
						$('#addExpArorError').html('')
						$('#addExpArorError').html('年化收益率开始值不能大于结束值')
						$('#addExpArorDiv').addClass("has-error")
						$('#addExpArorSecError').html('年化收益率结束值不能小于开始值')
						$('#addExpArorSecDiv').addClass("has-error")
						return
					}
				}
				
				//校验认购确认日不大于募集期满后最晚成立日
				var subscribeConfirmDays = parseInt(document.addProductForm.subscribeConfirmDays.value) || 0
				var foundDays = parseInt(document.addProductForm.foundDays.value) || 0
				
				if(subscribeConfirmDays >= 0 && foundDays > 0 && foundDays < subscribeConfirmDays) {
					$('#addSubscribeConfirmDaysDiv').removeClass("has-error")
					$('#addFoundDaysDiv').removeClass("has-error")
					$('#addSubscribeConfirmDaysError').html('')
					$('#addFoundDaysError').html('')

					$('#addSubscribeConfirmDaysError').html('认购确认日必须小于等于募集期满后最晚成立日')
					$('#addSubscribeConfirmDaysDiv').addClass("has-error")
					$('#addFoundDaysError').html('募集期满后最晚成立日必须大于等于认购确认日')
					$('#addFoundDaysDiv').addClass("has-error")
					return
				}

				//校验单笔投资最高份额不能小于单笔投资最低份额
				var investMinStr = document.addProductForm.investMin.value
				var investMaxStr = document.addProductForm.investMax.value

				if(investMinStr != null && investMinStr != '' && investMaxStr != null && investMaxStr != '') { //都有填写
					var investMin = parseFloat(investMinStr) || 0
					var investMax = parseFloat(investMaxStr) || 0
					if(investMin > investMax) {
						$('#addInvestMinDiv').removeClass("has-error")
						$('#addInvestMaxDiv').removeClass("has-error")
						$('#addInvestMinError').html('')
						$('#addInvestMaxError').html('')
						$('#addInvestMinError').html('单笔投资最低份额不能大于单笔投资最高份额')
						$('#addInvestMinDiv').addClass("has-error")
						$('#addInvestMaxError').html('单笔投资最高份额不能小于单笔投资最低份额')
						$('#addInvestMaxDiv').addClass("has-error")
						return
					}
				}

				//校验单笔赎回最低份额 必须小于单人单日赎回上限 并且小于单笔赎回最高份额
				var minRredeemStr = document.addProductForm.minRredeem.value
				var maxRredeemStr = document.addProductForm.maxRredeem.value
				var singleDailyMaxRedeemStr = document.addProductForm.singleDailyMaxRedeem.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var maxRredeem = parseFloat(maxRredeemStr) || 0
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && maxRredeemStr != null && maxRredeemStr != '') { //都有填写
					if(minRredeem > maxRredeem) {
						$('#addMinRredeemDiv').removeClass("has-error")
						$('#addMaxRredeemDiv').removeClass("has-error")
						$('#addMinRredeemError').html('')
						$('#addMaxRredeemError').html('')

						$('#addMinRredeemError').html('单笔赎回最低份额不能大于单笔赎回最高份额')
						$('#addMinRredeemDiv').addClass("has-error")
						$('#addMaxRredeemError').html('单笔赎回最高份额不能小于单笔赎回最低份额')
						$('#addMaxRredeemDiv').addClass("has-error")
						return
					}
				}
				if(minRredeemStr != null && minRredeemStr != '' && singleDailyMaxRedeemStr != null && singleDailyMaxRedeemStr != '') { //都有填写
					if(minRredeem > singleDailyMaxRedeem) {
						$('#addMinRredeemDiv').removeClass("has-error")
						$('#addSingleDailyMaxRedeemDiv').removeClass("has-error")
						$('#addMinRredeemError').html('')
						$('#addSingleDailyMaxRedeemError').html('')

						$('#addMinRredeemError').html('单笔赎回最低份额不能大于单人单日赎回上限')
						$('#addMinRredeemDiv').addClass("has-error")
						$('#addSingleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
						$('#addSingleDailyMaxRedeemDiv').addClass("has-error")
						return
					}
				}

				//校验起息日大于等于申购确认日
				var interestsDate = parseInt(document.addProductForm.interestsDate.value) || 0
				var purchaseConfirmDate = parseInt(document.addProductForm.purchaseConfirmDate.value) || 0
				if(purchaseConfirmDate > 0 && interestsDate > 0 && interestsDate < purchaseConfirmDate) {
					$('#addPurchaseConfirmDateDiv').removeClass("has-error")
					$('#addInterestsDateDiv').removeClass("has-error")
					$('#addPurchaseConfirmDateError').html('')
					$('#addInterestsDateError').html('')

					$('#addInterestsDateError').html('起息日必须大于等于申购确认日')
					$('#addInterestsDateDiv').addClass("has-error")
					$('#addPurchaseConfirmDateError').html('申购确认日必须小于等于起息日')
					$('#addPurchaseConfirmDateDiv').addClass("has-error")
					return
				}

				var dealStartTime = parseInt(document.addProductForm.dealStartTime.value.replace(/\:/g,'')) || 0
				var dealEndTime = parseInt(document.addProductForm.dealEndTime.value.replace(/\:/g,'')) || 0
				if(dealStartTime > 0 && dealEndTime > 0 && dealStartTime > dealEndTime) {
					$('#addDealStartTimeDiv').removeClass("has-error")
					$('#addDealEndTimeDiv').removeClass("has-error")
					$('#addDealStartTimeError').html('')
					$('#addDealEndTimeError').html('')

					$('#addDealStartTimeError').html('交易开始时间不能交易结束时间')
					$('#addDealStartTimeDiv').addClass("has-error")
					$('#addDealEndTimeError').html('交易结束时间不能小于交易开始时间')
					$('#addDealEndTimeDiv').addClass("has-error")
					return
				}

				var typeOid = $("#addProductTypeSelect  option:selected").val();
				document.addProductForm.files.value = JSON.stringify(addProductUploadFiles) //附件
				document.addProductForm.investFile.value = JSON.stringify(addInvestUploadFiles) //定向委托投资管理协议
				document.addProductForm.serviceFile.value = JSON.stringify(addServiceUploadFiles) //风险提示书

				if(document.addProductForm.expArorSec.value == "") {
					document.addProductForm.expArorSec.value = document.addProductForm.expAror.value
				}

				$('#addProductModal').modal('hide')
				if(typeOid == "PRODUCTTYPE_01") {
					document.addProductForm.dealStartTime.value = document.addProductForm.dealStartTime.value.replace(/\:/g,'')
					document.addProductForm.dealEndTime.value = document.addProductForm.dealEndTime.value.replace(/\:/g,'')
					$('#addProductType01Area_1').find('select').attr('disabled', false)
					$('#addProductForm').ajaxSubmit({
						url: config.api.savePeriodic,
						success: function(addResult) {
							if(addResult.errorCode == 0) {
								util.form.reset($('#addProductForm'))
								$('#productDesignTable').bootstrapTable('refresh')
							} else {
								alert(addResult.errorMessage)
							}
						}
					})
				} else {
					$('#addProductForm').ajaxSubmit({
						url: config.api.saveCurrent,
						success: function(addResult) {
							if(addResult.errorCode == 0) {
								util.form.reset($('#addProductForm'))
								$('#productDesignTable').bootstrapTable('refresh')
							} else {
								alert(addResult.errorMessage)
							}

						}
					})
				}
			})

			/**
			 * 编辑产品上传投资协议表格数据源
			 */
			var updateInvestUploadFiles = []

			/**
			 * 编辑产品初始化上传投资协议插件，在success里将上传成功投资协议插入到表格中
			 */
			$$.uploader({
				container: $('#updateInvestUploader'),
				btnName: '上传定向委托投资管理协议',
				success: function(file) {
					file.furl = file.url
					updateInvestUploadFiles = []
					updateInvestUploadFiles.push(file)
					$('#updateInvestUploadTable').bootstrapTable('load', updateInvestUploadFiles)
				}
			})

			/**
			 * 编辑产品投资协议表格配置
			 */
			var updateInvestUploadTableConfig = {
				columns: [{
					field: 'name',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'updateInvestUploadTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl + '?realname=' + row.name
						},
						'click .item-delete': function(e, value, row) {
							var index = updateInvestUploadFiles.indexOf(row)
							updateInvestUploadFiles.splice(index, 1)
							$('#updateInvestUploadTable').bootstrapTable('load', updateInvestUploadFiles)
						}
					}
				}]
			}

			/**
			 * 编辑产品投资协议表格初始化
			 */
			$('#updateInvestUploadTable').bootstrapTable(updateInvestUploadTableConfig)

			/**
			 * 编辑产品上传风险提示书表格数据源
			 */
			var updateServiceUploadFiles = []

			/**
			 * 编辑产品初始化上传风险提示书插件，在success里将上传成功投资协议插入到表格中
			 */
			$$.uploader({
				container: $('#updateServiceUploader'),
				btnName: '上传风险提示书',
				success: function(file) {
					file.furl = file.url
					updateServiceUploadFiles = []
					updateServiceUploadFiles.push(file)
					$('#updateServiceUploadTable').bootstrapTable('load', updateServiceUploadFiles)
				}
			})

			/**
			 * 编辑产品风险提示书表格配置
			 */
			var updateServiceUploadTableConfig = {
				columns: [{
					field: 'name',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'updateServiceUploadTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl + '?realname=' + row.name
						},
						'click .item-delete': function(e, value, row) {
							var index = updateServiceUploadFiles.indexOf(row)
							updateServiceUploadFiles.splice(index, 1)
							$('#updateServiceUploadTable').bootstrapTable('load', updateServiceUploadFiles)
						}
					}
				}]
			}

			/**
			 * 编辑产品风险提示书表格初始化
			 */
			$('#updateServiceUploadTable').bootstrapTable(updateServiceUploadTableConfig)

			/**
			 * 编辑产品上传附件表格数据源
			 */
			var updateProductUploadFiles = []

			/**
			 * 编辑产品初始化上传附件插件，在success里将上传成功附件插入到表格中
			 */
			$$.uploader({
				container: $('#updateProductUploader'),
				btnName: '上传定向委托投资管理交易说明书',
				success: function(file) {
					file.furl = file.url
					updateProductUploadFiles.push(file)
					$('#updateProductUploadTable').bootstrapTable('load', updateProductUploadFiles)
				}
			})

			/**
			 * 编辑产品附件表格配置
			 */
			var updateProductUploadTableConfig = {
				columns: [{
					field: 'name',
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}, {
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'updateProductUploadTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl + '?realname=' + row.name
						},
						'click .item-delete': function(e, value, row) {
							var index = updateProductUploadFiles.indexOf(row)
							updateProductUploadFiles.splice(index, 1)
							$('#updateProductUploadTable').bootstrapTable('load', updateProductUploadFiles)
						}
					}
				}]
			}

			/**
			 * 编辑产品附件表格初始化
			 */
			$('#updateProductUploadTable').bootstrapTable(updateProductUploadTableConfig)

			/**
			 * 编辑产品“保存”按钮点击事件
			 */
			$('#updateProductSubmit').on('click', function() {
				if(!$('#updateProductForm').validator('doSubmitCheck')) return

				//校验预期年化收益率开始值不能大于预期年化收益率结束值
				var expAror = parseFloat(document.updateProductForm.expAror.value) || 0
				var expArorSecStr = document.updateProductForm.expArorSec.value

				if(expArorSecStr != null && expArorSecStr != '') { //结束值有填写
					var expArorSec = parseFloat(expArorSecStr) || 0
					
					if(!expAror){
						$('#updateExpArorDiv').removeClass("has-error")
						$('#updateExpArorSecDiv').removeClass("has-error")
						$('#updateExpArorSecError').html('')
						$('#updateExpArorError').html('')
						$('#updateExpArorError').html('预期年化收益率只能为前4位后2位小数')
						$('#updateExpArorDiv').addClass("has-error")
						return
					}
					
					if(expAror > expArorSec) {
						$('#updateExpArorDiv').removeClass("has-error")
						$('#updateExpArorSecDiv').removeClass("has-error")
						$('#updateExpArorSecError').html('')
						$('#updateExpArorError').html('')
						$('#updateExpArorError').html('年化收益率开始值不能大于结束值')
						$('#updateExpArorDiv').addClass("has-error")
						$('#updateExpArorSecError').html('年化收益率结束值不能小于开始值')
						$('#updateExpArorSecDiv').addClass("has-error")
						return
					}
				}
				
				//校验认购确认日不大于募集期满后最晚成立日
				var subscribeConfirmDays = parseInt(document.updateProductForm.subscribeConfirmDays.value) || 0
				var foundDays = parseInt(document.updateProductForm.foundDays.value) || 0
				
				if(subscribeConfirmDays >= 0 && foundDays > 0 && foundDays < subscribeConfirmDays) {
					$('#updateSubscribeConfirmDaysDiv').removeClass("has-error")
					$('#updateFoundDaysDiv').removeClass("has-error")
					$('#updateSubscribeConfirmDaysError').html('')
					$('#updateFoundDaysError').html('')

					$('#updateSubscribeConfirmDaysError').html('认购确认日必须小于等于募集期满后最晚成立日')
					$('#updateSubscribeConfirmDaysDiv').addClass("has-error")
					$('#updateFoundDaysError').html('募集期满后最晚成立日必须大于等于认购确认日')
					$('#updateFoundDaysDiv').addClass("has-error")
					return
				}

				//校验单笔投资最高份额不能小于单笔投资最低份额
				var investMinStr = document.updateProductForm.investMin.value
				var investMaxStr = document.updateProductForm.investMax.value

				if(investMinStr != null && investMinStr != '' && investMaxStr != null && investMaxStr != '') { //都有填写
					var investMin = parseFloat(investMinStr) || 0
					var investMax = parseFloat(investMaxStr) || 0
					if(investMin > investMax) {
						$('#updateInvestMinDiv').removeClass("has-error")
						$('#updateInvestMaxDiv').removeClass("has-error")
						$('#updateInvestMinError').html('')
						$('#updateInvestMaxError').html('')
						$('#updateInvestMinError').html('单笔投资最低份额不能大于单笔投资最高份额')
						$('#updateInvestMinDiv').addClass("has-error")
						$('#updateInvestMaxError').html('单笔投资最高份额不能小于单笔投资最低份额')
						$('#updateInvestMaxDiv').addClass("has-error")
						return
					}
				}

				//校验单笔赎回最低份额 必须小于单人单日赎回上限 并且小于单笔赎回最高份额
				var minRredeemStr = document.updateProductForm.minRredeem.value
				var maxRredeemStr = document.updateProductForm.maxRredeem.value
				var singleDailyMaxRedeemStr = document.updateProductForm.singleDailyMaxRedeem.value

				var minRredeem = parseFloat(minRredeemStr) || 0
				var maxRredeem = parseFloat(maxRredeemStr) || 0
				var singleDailyMaxRedeem = parseFloat(singleDailyMaxRedeemStr) || 0

				if(minRredeemStr != null && minRredeemStr != '' && maxRredeemStr != null && maxRredeemStr != '') { //都有填写
					if(minRredeem > maxRredeem) {
						$('#updateMinRredeemDiv').removeClass("has-error")
						$('#updateMaxRredeemDiv').removeClass("has-error")
						$('#updateMinRredeemError').html('')
						$('#updateMaxRredeemError').html('')

						$('#updateMinRredeemError').html('单笔赎回最低份额不能大于单笔赎回最高份额')
						$('#updateMinRredeemDiv').addClass("has-error")
						$('#updateMaxRredeemError').html('单笔赎回最高份额不能小于单笔赎回最低份额')
						$('#updateMaxRredeemDiv').addClass("has-error")
						return
					}
				}
				if(minRredeemStr != null && minRredeemStr != '' && singleDailyMaxRedeemStr != null && singleDailyMaxRedeemStr != '') { //都有填写
					if(minRredeem > singleDailyMaxRedeem) {
						$('#updateMinRredeemDiv').removeClass("has-error")
						$('#updateSingleDailyMaxRedeemDiv').removeClass("has-error")
						$('#updateMinRredeemError').html('')
						$('#updateSingleDailyMaxRedeemError').html('')

						$('#updateMinRredeemError').html('单笔赎回最低份额不能大于单人单日赎回上限')
						$('#updateMinRredeemDiv').addClass("has-error")
						$('#updateSingleDailyMaxRedeemError').html('单人单日赎回上限不能小于单笔赎回最低份额')
						$('#updateSingleDailyMaxRedeemDiv').addClass("has-error")
						return
					}
				}

				//校验起息日大于等于申购确认日
				var interestsDate = parseInt(document.updateProductForm.interestsDate.value) || 0
				var purchaseConfirmDate = parseInt(document.updateProductForm.purchaseConfirmDate.value) || 0
				if(purchaseConfirmDate > 0 && interestsDate > 0 && interestsDate < purchaseConfirmDate) {
					$('#updateMinRredeemDiv').removeClass("has-error")
					$('#updateSingleDailyMaxRedeemDiv').removeClass("has-error")
					$('#updateMinRredeemError').html('')
					$('#updateSingleDailyMaxRedeemError').html('')

					$('#updatePurchaseConfirmDateError').html('申购确认日必须小于等于起息日')
					$('#updatePurchaseConfirmDateDiv').addClass("has-error")
					$('#updateInterestsDateError').html('起息日必须大于等于申购确认日')
					$('#updateInterestsDateDiv').addClass("has-error")
					return
				}

				var dealStartTime = parseInt(document.updateProductForm.dealStartTime.value.replace(/\:/g,'')) || 0
				var dealEndTime = parseInt(document.updateProductForm.dealEndTime.value.replace(/\:/g,'')) || 0
				if(dealStartTime > 0 && dealEndTime > 0 && dealStartTime > dealEndTime) {
					$('#updateDealStartTimeDiv').removeClass("has-error")
					$('#updateDealEndTimeDiv').removeClass("has-error")
					$('#updateDealStartTimeError').html('')
					$('#updateDealEndTimeError').html('')

					$('#updateDealStartTimeError').html('交易开始时间不能交易结束时间')
					$('#updateDealStartTimeDiv').addClass("has-error")
					$('#updateDealEndTimeError').html('交易结束时间不能小于交易开始时间')
					$('#updateDealEndTimeDiv').addClass("has-error")
					return
				}

				var typeOid = $("#typeOid").val();
				document.updateProductForm.files.value = JSON.stringify(updateProductUploadFiles) //附件
				document.updateProductForm.investFile.value = JSON.stringify(updateInvestUploadFiles) //定向委托投资管理协议
				document.updateProductForm.serviceFile.value = JSON.stringify(updateServiceUploadFiles) //风险提示书
				
				if(typeOid == "PRODUCTTYPE_01") {
					document.updateProductForm.dealStartTime.value = document.updateProductForm.dealStartTime.value.replace(/\:/g,'')
					document.updateProductForm.dealEndTime.value = document.updateProductForm.dealEndTime.value.replace(/\:/g,'')
					$('#updateProductType01Area_1').find('select').attr('disabled', false)
					$('#updateProductForm').ajaxSubmit({
						url: config.api.updatePeriodic,
						success: function(addResult) {
							$('#updateProductModal').modal('hide')
							$('#productDesignTable').bootstrapTable('refresh')
						}
					})
				} else {
					$('#updateProductForm').ajaxSubmit({
						url: config.api.updateCurrent,
						success: function(addResult) {
							$('#updateProductModal').modal('hide')
							$('#productDesignTable').bootstrapTable('refresh')
						}
					})
				}
			})

			/**
			 * 提交审核按钮点击事件
			 */
			$('#productAudit').on('click', function() {
				if(checkItems.length > 0) {
					var productNames = checkItems.map(function(item) {
						return item
					})
					var le = productNames.length

					if($("#auditProductNames").children().length > 0) {
						$("#auditProductNames").children().remove()
					}

					for(var i = 0; i < le; i++) {
						var p = $('<p></p>')
						if(productNames[i].typeOid === 'PRODUCTTYPE_01') { //定期
							p.html(productNames[i].name)
						} else {
							if(productNames[i].rewardNum > 0) {
								p.html(productNames[i].name)
							} else {
								p.html('<font color="red">' + productNames[i].name + '：未设置奖励收益</font>')
							}
						}
						$("#auditProductNames").append(p)

					}
					var h5 = $('<h5>确认提交以上产品进行审核吗？</h5>')
					$("#auditProductNames").append(h5)
					$('#productAuditModal').modal('show')
				} else {
					if($("#alertMessage").children().length > 0) {
						$("#alertMessage").children().remove()
					}
					var h5 = $('<h5>请选择产品</h5>')
					$("#alertMessage").append(h5)
					$('#alertModal').modal('show')
				}
			})

			/**
			 * 提交审核弹窗 -> 提交按钮点击事件
			 */
			$('#doProductAudit').on('click', function() {
				/**
				 * 获取id数组
				 */
				var oids = checkItems.map(function(item) {
					return item.oid
				})

				/**
				 * 提交数组
				 */
				http.post(
					config.api.productAuditApply, {
						data: {
							oids: JSON.stringify(oids)
						},
						contentType: 'form',
					},
					function(result) {
						checkItems = []
						$('#productAuditModal').modal('hide')
						if(result.errorCode == 0) {
							$('#productDesignTable').bootstrapTable('refresh')
						}
					}
				)

			})

			/**
			 * 选择资产池按钮点击事件
			 */
			$('#productAssetPool').on('click', function() {
				$('#assetPoolModal').modal('show')
			})

			/**
			 * 设置奖励收益表格配置
			 */
			var addProductRewardTableConfig = {
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
				}, {
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '删除',
							type: 'button',
							class: 'item-delete'
						}]
						return util.table.formatter.generateButton(buttons, 'addProductRewardTable')
					},
					events: {
						'click .item-delete': function(e, value, row) {
							var index = addProductRewards.indexOf(row)
							addProductRewards.splice(index, 1)
							$('#addProductRewardTable').bootstrapTable('load', addProductRewards)
						}
					}
				}]
			}

			/**
			 *  设置奖励收益表格初始化
			 */
			$('#addProductRewardTable').bootstrapTable(addProductRewardTableConfig)

			/**
			 * 设置奖励收益“确定”按钮点击事件
			 */
			$('#addProductRewardSubmit').on('click', function() {
				if(!$('#addProductRewardForm').validator('doSubmitCheck')) return

				//校验奖励收益设置 订单持有结束天数必须大于订单持有开始天数
				var startDate = parseInt(document.addProductRewardForm.startDate.value) || 0
				var endDate = parseInt(document.addProductRewardForm.endDate.value) || 0

				if(startDate > 0 && endDate > 0 && startDate > endDate) {
					$('#startDateDiv').removeClass("has-error")
					$('#endDateDiv').removeClass("has-error")
					$('#startDateError').html('')
					$('#endDateError').html('')

					$('#endDateError').html('订单持有结束天数必须大于订单持有开始天数')
					$('#endDateDiv').addClass("has-error")
					$('#startDateError').html('订单持有开始天数必须小于订单持有结束天数')
					$('#startDateDiv').addClass("has-error")
					return
				}

				var object = new Object();
				object.oid = '';
				object.level = document.addProductRewardForm.level.value
				object.startDate = document.addProductRewardForm.startDate.value
				object.endDate = document.addProductRewardForm.endDate.value
				object.ratio = document.addProductRewardForm.ratio.value
				addProductRewards.push(object)

				$('#addProductRewardTable').bootstrapTable('load', addProductRewards)

				util.form.reset($('#addProductRewardForm'))
			})

			/**
			 * 设置奖励收益“保存”按钮点击事件
			 */
			$('#saveProductRewardSubmit').on('click', function() {
				document.saveProductRewardForm.productOid.value = selectProductOid
				document.saveProductRewardForm.reward.value = JSON.stringify(addProductRewards)
				$('#saveProductRewardForm').ajaxSubmit({
					url: config.api.saveProductReward,
					success: function(addResult) {
						$('#productRewardModal').modal('hide')
						util.form.reset($('#saveProductRewardForm'))
						checkItems = []
						$('#productDesignTable').bootstrapTable('refresh')
					}
				})

			})

			//校验奖励收益设置 订单持有结束天数必须大于订单持有开始天数
			$(document.addProductRewardForm.startDate).on('input', function() {
				var flag = true
				$('#startDateDiv').removeClass("has-error")
				$('#endDateDiv').removeClass("has-error")
				$('#startDateError').html('')
				$('#endDateError').html('')

				var startDate = parseInt(this.value) || 0
				var endDate = parseInt(document.addProductRewardForm.endDate.value) || 0

				if(endDate > 0 && startDate > endDate) {
					$('#startDateError').html('订单持有开始天数必须小于订单持有结束天数')
					$('#startDateDiv').addClass("has-error")
					flag = false
				}
				return flag
			})

			$(document.addProductRewardForm.endDate).on('input', function() {
				var flag = true
				$('#startDateDiv').removeClass("has-error")
				$('#endDateDiv').removeClass("has-error")
				$('#startDateError').html('')
				$('#endDateError').html('')

				var endDate = parseInt(this.value) || 0
				var startDate = parseInt(document.addProductRewardForm.startDate.value) || 0

				if(startDate > 0 && endDate > 0 && startDate > endDate) {
					$('#endDateError').html('订单持有结束天数必须大于订单持有开始天数')
					$('#endDateDiv').addClass("has-error")
					flag = false
				}
				return flag

			})
			
			function qryInfo(value, row) {
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
			
			/**
			 * 基础标签为体验金，申购确认日赎回确认日只能为0
			 */
			function formatBasicProductLabel(form, selection) {
				if($(selection).find('option:selected').attr('data-code') == '8'){
					$(form.purchaseConfirmDate).attr('data-validint','0-244').attr('data-error','应该大于等于0小于244的整数').val(0).attr('readonly','readonly')
					$(form.redeemConfirmDate).attr('data-validint','0-244').attr('data-error','应该大于等于0小于244的整数').val(0).attr('readonly','readonly')
					$(form.interestsDate).attr('data-validint','0-244').attr('data-error','应该大于等于0小于244的整数').val(0).attr('readonly','readonly')
				}else{
					$(form.purchaseConfirmDate).attr('data-validint','1-244').attr('data-error','应该大于等于1小于244的整数').removeAttr('readonly')
					$(form.redeemConfirmDate).attr('data-validint','1-244').attr('data-error','应该大于等于1小于244的整数').removeAttr('readonly')
					$(form.interestsDate).attr('data-validint','1-244').attr('data-error','应该大于等于1小于244的整数').removeAttr('readonly')
				}
				$(form).validator('destroy')
				util.form.validator.init($(form))
			}
		}
	}

})