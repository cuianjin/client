/**
 * 现金管理类工具备选库
 */
define([
	'http',
	'config',
	'extension',
	'util'
], function(http, config, $$, util) {
	return {
		name: 'liquidAssetStorage',
		init: function() {
			// js逻辑写在这里
			var cashtool; // 缓存 选中的某一行的 现金工具信息
			// 分页配置
			var pageOptions = {
				op: 'storageList',
				page: 1,
				rows: 10
			};
			var revenuePageOptions = {
				page: 1,
				rows: 10,
				liquidAssetOid: ''
			};
			// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.liquidAssetPool.list, {
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
				onClickRow: function(row, $element) {
					cashtool = row;
				},
				onClickCell: function(field, value, row, $element) {
					switch(field) {
						case 'name':
							toDetail(value, row);
					}
				},
				columns: [{ // 代码
					field: 'sn',
					align: 'left'
					
				}, { // 基金名称
					field: 'name',
					align: 'left',
					class: 'table_title_detail'
				}, {
					field: 'type',
					align: 'left',
					formatter: function(val) {
						if(val == "CASHTOOLTYPE_01") {
							return "货币基金";
						} else if(val == "CASHTOOLTYPE_02") {
							return "协定存款";
						} else {
							return "";
						}
					}
				}, { // 7日年化收益率
					field: 'weeklyYield',
					align: 'right',
					formatter: function(val) {
						return $.number(util.safeCalc(val, '*', 100, 6), 6);
					}
				}, { // 万份收益
					field: 'dailyProfit',
					align: 'right',
					formatter: function(val) {
						return $.number(util.safeCalc(val, '*', 1, 6), 6);
					}
				}, { // 状态
					field: 'state',
					align: 'left',
					formatter: function(val) {
						return '<span class="text-green">审核通过</span>';
					}
				}, {
					width: 260,
					align: 'center',
					formatter: function(val, row, index) {
						if(row.type === 'CASHTOOLTYPE_01') {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								isRender: true,
								isCloseBottom: index >= $('#liquidAssetAccessTable').bootstrapTable('getData').length - 1,
								sub: [{
									text: '移除出库',
									class: 'item-remove',
									isRender: row.state !== 'invalid'
								}, {
									text: '收益采集',
									class: 'item-cashToolRevenue',
									isRender: row.state === 'collecting'
								}]
							}]
						} else {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
								isRender: true,
//								isCloseBottom: index >= $('#liquidAssetAccessTable').bootstrapTable('getData').length - 1,
								sub: [{
									text: '移除出库',
									class: 'item-remove',
									isRender: row.state !== 'invalid'
								}]
							}]
						}

						return util.table.formatter.generateButton(buttons, 'liquidAssetAccessTable');
					},
					events: {
						'click .item-remove': function(e, value, row) { // 移除出库
							$("#confirmTitle").html("确定移除现金类标的？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.liquidAssetPool.remove, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							});
						},
						'click .item-cashToolRevenue': function(e, value, row) { // 收益采集-显示弹窗
							// 获取日期校验
							http.post(config.api.liquidAssetPool.dateVerify, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(rlt) {

								// 初始化
								cashtool = row;
								revenuePageOptions.liquidAssetOid = row.oid;
								revenuePageOptions.page = 1;
								revenuePageOptions.rows = 10;

								$('#yieldTable').bootstrapTable('refresh');

								$$.detailAutoFix($('#liquidAssetYieldDetail'), row); // 自动填充详情

								// 重置和初始化表单验证
								$("#liquidAssetYieldForm").validator('destroy');
								util.form.validator.init($("#liquidAssetYieldForm"));

								$("#liquidAsset_oid").val(row.oid);

								resetYieldForm();

								//之前是否有收益采集
								if(!rlt.isProfited) {
									$('#profitStartDate').removeAttr('readonly');
								};

								//今天是否收益采集
								if(!rlt.maxDateIsProfited) {
									$("#liquidAssetYieldDiv").show();
									$('#liquidAssetYieldSubmit').show();
								} else {
									$("#liquidAssetYieldDiv").hide();
									$('#liquidAssetYieldSubmit').hide();
								};

								//收益开始日，收益截止日最大最小值
								$('#profitStartDate').data("DateTimePicker").maxDate(rlt.maxProfitDeadlineDate);
								$('#profitDeadlineDate').data("DateTimePicker").minDate(rlt.profitStartDate);
								$('#profitDeadlineDate').data("DateTimePicker").maxDate(rlt.maxProfitDeadlineDate);

								//收益开始日，收益截止日
								$("#profitStartDate").val(rlt.profitStartDate);
								$("#profitDeadlineDate").val(rlt.maxProfitDeadlineDate);

								generateHtml();
								$('#liquidAssetYieldModal').modal('show');
								$('#liquidAssetYieldModal').bootstrapTable('refresh');
								return;

							});
						}

					}
				}]
			}

			var resetYieldForm = function() {
				$("#profitStartDate").val('');
				$("#profitDeadlineDate").val('');
				$('#profitStartDate').attr('readonly', 'readonly');
				$('#autoHtml').empty();
				$("#liquidAssetYieldDiv").hide();
			}

			// 分页配置
			// 数据表格配置
			var revenueTableConfig = {
				ajax: function(origin) {
					http.post(config.api.liquidAssetPool.listYield, {
						data: revenuePageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: revenuePageOptions.page,
				pageSize: revenuePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getRevenueQueryParams,
				onLoadSuccess: function() {},
				columns: [{
						//编号
						// field: 'oid',
						align: 'center',
						width: 60,
						formatter: function(val, row, index) {
							return index + 1
						}
					}, { // 收益日
						field: 'profitDate',
						align: 'right'
					},
					{ // 万份收益
						field: 'dailyProfit',
						align: 'right',
						formatter: function(val) {
							return $.number(val, 6);
						}
					}, { // 7日年化收益
						field: 'weeklyYield',
						align: 'right',
						formatter: function(val) {
							return $.number(util.safeCalc(val, '*', 100, 6), 6);
						}
					}, { // 录入时间
						field: 'createTime',
						visible: false,
					}, { // 操作员
						field: 'operator',
						visible: false,
					},
				],
			}

			$('#yieldTable').bootstrapTable(revenueTableConfig);

			// 初始化数据表格
			$('#dataTable').bootstrapTable(tableConfig)
			// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#dataTable'))

			//			// 查询资产池拥有该标的信息
			//			var assetPoolPageOptions = {
			//					page: 1,
			//					rows: 10
			//				}
			//				// 数据表格配置
			//			var assetPoolTableConfig = {
			//				ajax: function(origin) {
			//					http.post(config.api.duration.target.getDataByCashtoolOid, {
			//						data: assetPoolPageOptions,
			//						contentType: 'form'
			//					}, function(rlt) {
			//						origin.success(rlt)
			//					})
			//				},
			//				pageNumber: assetPoolPageOptions.page,
			//				pageSize: assetPoolPageOptions.rows,
			//				pagination: true,
			//				sidePagination: 'server',
			//				pageList: [10, 20, 30, 50, 100],
			//				queryParams: getAssetPoolQueryParams,
			//				onLoadSuccess: function() {},
			//				columns: [{ // 编号
			//					field: 'sn',
			//					visible: false
			//				}, { // 资产池名称
			//					field: 'name',
			//				}, { // 资产池金额
			//					field: 'volume',
			//					formatter: function(val) {
			//						if(val)
			//							return(val / 10000).toFixed(2) + "万";
			//						return val;
			//					}
			//				}]
			//			};
			//			$('#assetPoolTable').bootstrapTable(assetPoolTableConfig);
			//			$('#assetPoolTable_treaty').bootstrapTable(assetPoolTableConfig);

			// 收益采集 按钮点击事件  保存
			$("#liquidAssetYieldSubmit").click(function() {
				if(!$('#liquidAssetYieldForm').validator('doSubmitCheck')) return

				var obj = {
					oid: $('#liquidAsset_oid').val(),
					profits: []
				}

				var checked = true;
				var forms = $('.createProfit');
				$.each(forms, function(index) {
					// hh01 forms[index].
					var x = $(forms[index]).validator('doSubmitCheck');
					checked &= x;
					var data = util.form.serializeJson(forms[index]);
					obj.profits.push(data);
				});
				if (checked) {
					http.post(config.api.liquidAssetPool.yieldSave, {
						data: JSON.stringify(obj)
					}, function(rlt) {
						$('#liquidAssetYieldForm').clearForm();
						$('#liquidAssetYieldModal').modal('hide');
						$('#dataTable').bootstrapTable('refresh');
					});
				}
			});

			var generateHtml = function() {
				$(".auto_profitDate").remove(); //初始化html页面
				var startDate = $("#profitStartDate").val(); //开始日期
				var endDate = $("#profitDeadlineDate").val(); //截止日期
				var endError = document.getElementById("endError"); //错误提示页面
				endError.innerHTML = "";
				s1 = new Date(startDate.replace(/-/g, "/"));
				s2 = new Date(endDate.replace(/-/g, "/"));

				var timeStamp = s2.getTime() - s1.getTime();
				var dayNum = parseInt(timeStamp / (1000 * 60 * 60 * 24)); //截止日期和开始日期间隔天数
				if(dayNum < 0) {
					endError.innerHTML = "截止日期不能不开始日期小";
					$("#profitDeadlineDate").val("");
					return;
				}
				$("#autoHtml").empty();
				for(var i = 0; i <= dayNum; i++) {
					var profitDate = new Date(s1 - 0 + i * 86400000);
					var yieldHtml = autoHtml(profitDate.getFullYear() + "-" + (profitDate.getMonth() + 1) + "-" + profitDate.getDate());
					var yieldForm = $(yieldHtml);
					$("#autoHtml").append(yieldForm);
					
					yieldForm.validator('destroy');
					yieldForm.validator({
						custom: {
							validfloat: util.form.validator.validfloat
						},
						errors: {
							validfloat: ' '
						}
					});
					
				}
			}

			//开始日期和截止日期
			$('#profitStartDate').off().on('blur', function() {
				$('#profitDeadlineDate').data("DateTimePicker").minDate(this.value);
				generateHtml();
			});
			$("#profitDeadlineDate").off().on('blur', function() {
				$('#profitStartDate').data("DateTimePicker").maxDate(this.value);
				generateHtml();
			});

			function getQueryParams(val) {
				var form = document.searchForm
				$.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象

				pageOptions.rows = val.limit
				pageOptions.page = parseInt(val.offset / val.limit) + 1
				return val
			}

			function getRevenueQueryParams(val) {

				//var form = document.searchForm
				//$.extend(revenuePageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象          

				//revenuePageOptions.liquidAssetOid = cashtool ? cashtool.oid : "";
				revenuePageOptions.rows = val.limit
				revenuePageOptions.page = parseInt(val.offset / val.limit) + 1

				return val
			}

			function getAssetPoolQueryParams(val) {
				assetPoolPageOptions.oid = cashtool ? cashtool.oid : "";
				assetPoolPageOptions.rows = val.limit
				assetPoolPageOptions.page = parseInt(val.offset / val.limit) + 1
				return val;
			}

			/**
			 * 格式化现金管理工具
			 * @param {Object} t
			 */
			function formatLiquidAsset(t) {
				if(t) {
					var t2 = {};
					$.extend(t2, t); //合并对象，修改第一个对象
					//					t2.guarRatio = t2.guarRatio ? (t2.guarRatio * 100).toFixed(2) + '%' : ""; // 保本比例（%）
					//					t2.weeklyYield = t2.weeklyYield ? (t2.weeklyYield * 100).toFixed(2) + '%' : ""; // 保本比例（%）
					t2.confirmDays = t2.confirmDays ? t2.confirmDays + '个工作日以内' : t2.confirmDays;

					return t2;
				}
				return t;
			}

			/**
			 * 收益采集自动生成文本框
			 */
			function autoHtml(profitDate) {
				var autoHtml =
					'<form id="auto-gen-'+profitDate+'" class="createProfit">' +
					'<div class="row">' +
					'<div class="col-sm-6 auto_profitDate">' +
					'<div class="form-group">' +
					'<label>' + profitDate + '</label>' +
					'<div class="input-group input-group-sm">' +
					'<span class="input-group-addon">万份收益</span>' +
					'<input name="dailyProfit" type="text" class="form-control inputh input-sm" placeholder="" required data-validfloat="3.4" maxlength="8" data-error="万份收益格式错误">' +
					'<span class="input-group-addon">元</span>' +
					'</div>' +
					'<div class="help-block with-errors text-red"></div>' +
					'</div>' +
					'</div>' +
					'<div class="col-sm-6 auto_profitDate">' +
					'<div class="form-group">' +
					'<label>&nbsp;</label>' +
					'<div class="input-group input-group-sm">' +
					'<span class="input-group-addon">7日年化收益率</span>' +
					'<input name="weeklyYield" type="text" class="form-control input-sm inputh" placeholder="" required data-validfloat="3.4" maxlength="8" data-error="7日年化收益率格式错误">' +
					'<span class="input-group-addon">%</span>' +
					'</div>' +
					'<div class="help-block with-errors text-red"></div>' +
					'</div>' +
					'</div>' +
					'<input type="hidden" name="profitDate"  value="' + profitDate + '" />' +
					'</div>'+
					'</form>';
				return autoHtml;
			}

			/**
			 * 格式化风险等级
			 * @param {Object} value
			 * @param {Object} row
			 */
			function formatRiskLevel(val) {
				if(val == 'R1') {
					return 'R1 - 谨慎型'
				} else if(val == 'R2') {
					return 'R2 - 稳健型'
				} else if(val == 'R3') {
					return 'R3 - 平衡型'
				} else if(val == 'R4') {
					return 'R4 - 进取型'
				} else if(val == 'R5') {
					return 'R5 - 激进型'
				}
			}

			/**
			 * 标的详情
			 */
			function toDetail(value, row) {
				http.post(config.api.liquidAsset.detailQuery, {
					data: {
						oid: row.oid
					},
					contentType: 'form'
				}, function(result) {
					var data = result;
					data.riskLevel = formatRiskLevel(data.riskLevel); // 格式化风险等级
					data.weeklyYield = $.number(util.safeCalc(data.weeklyYield, '*', 100, 6), 6);
					data.dailyProfit = $.number(util.safeCalc(data.dailyProfit, '*', 1, 6), 6);
					if(data.type == "CASHTOOLTYPE_01") {
						data.type = '货币基金';
						$$.detailAutoFix($('#liquidAssetDetailModal'), formatLiquidAsset(data)); // 自动填充详情
						// 初始化数据表格
						$('#assetPoolTable').bootstrapTable('refresh');
						$('#liquidAssetDetailModal').modal('show');
					} else if(data.type == "CASHTOOLTYPE_02") {
						data.type = '协定存款';
						data.baseAmount = util.safeCalc(data.baseAmount, '/', 10000, 6);
						data.baseYield = util.safeCalc(data.baseYield, '*', 100, 2);
						data.yield = util.safeCalc(data.yield, '*', 100, 2);
						$$.detailAutoFix($('#liquidAssetDetailModal_treaty'), data); // 自动填充详情
						// 初始化数据表格
						$('#assetPoolTable_treaty').bootstrapTable('refresh');
						$('#liquidAssetDetailModal_treaty').modal('show');
					}
				})
			}
		}
	}
})