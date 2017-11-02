/**
 * 风险关键指标维护
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'riskIndicate',
		init: function() {
			$(document.addForm.cateTitle).attr('data-remote', config.api.system.config.ccr.cate.validateTitle); // 初始化指标分类名称远程校验URL

			var queryParams = {
				type: '',
				keyword: ''
			};

			$('#dataTable').bootstrapTable({
				ajax: function(origin) {
					http.post(config.api.system.config.ccr.indicate.search, {
						data: queryParams,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				queryParams: function(val) {
					var form = document.searchForm;
					queryParams.type = form.type.value.trim();
					queryParams.keyword = form.keyword.value.trim();
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return index + 1
					}
				}, {
					field: 'cateType',
					formatter: function(val, row, index) {
						if (val == 'WARNING')
							return '风险预警指标';
						if (val == 'SCORE')
							return '风险评分指标';
						return val;
					}
				}, {
					field: 'cateTitle'
				}, {
					field: 'indicateTitle',
				}, {
					field: 'indicateDataType',
					formatter: function(val, row, index) {
						if (val == 'NUMBER')
							return '数值';
						if (val == 'NUMRANGE')
							return '数值区间';
						if (val == 'TEXT')
							return '文本'
						return val;
					}
				}, {
					field: 'indicateDataUnit'
				}, {
					field: 'indicateState',
					formatter: function(val, row, index) {
						if (val == 'ENABLE')
							return '启用';
						if (val == 'DISABLE')
							return '禁用';
						if (val == 'DELETE')
							return '删除';
						return val;
					}
				}, {
					align: 'center',
					formatter: function(val, row, index) {

//						var updateButton = {
//							text: '修改',
//							type: 'button',
//							class: 'item-update',
//							isRender: true
//						};

						var enableButton = {
							text: '启用',
							type: 'button',
							class: 'item-enable',
							isRender: true
						};

						var disableButton = {
							text: '禁用',
							type: 'button',
							class: 'item-disable',
							isRender: true
						};

//						var deleteButton = {
//							text: '删除',
//							type: 'button',
//							class: 'item-delete',
//							isRender: true
//						};

						var buttons = [];
						if (row.indicateState == 'ENABLE') {
							buttons.push(disableButton);
						};
						if (row.indicateState == 'DISABLE') {
							buttons.push(enableButton)
						};

						var format = util.table.formatter.generateButton(buttons, 'dataTable');
						format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
            			+'<span style=" margin:auto 0px auto 10px;cursor: pointer;width: 35px;" class="fa fa-trash-o item-delete"></span>';
						
						return format;
						
						
					},
					events: {
						'click .item-update': function(e, value, row) {

							http.post(config.api.system.config.ccr.cate.options, {
								data: {},
								contentType: 'form'
							}, function(val) {
								$.each(val, function(key, value) {
									value.push({
										oid: '',
										type: key,
										title: '其他'
									});
								});
								$('#updateForm').resetForm();
								$('#updateModal').modal('show');
								var form = document.updateForm;
								var cateType = form.cateType;
								$(cateType).off().on('change', function() {
									if (!val[cateType.value]) {
										val[cateType.value] = [{
											oid: '',
											title: '其他',
											type: cateType.value
										}];
									}

									$(form.cateOid).empty();
									$.each(val[cateType.value], function(i, v) {
										$(form.cateOid).append('<option value="' + v.oid + '">' + v.title + '</option>')
									});

									$(form.cateOid).change();
								});

								$(form.cateOid).off().on('change', function() {

									if (form.cateOid.value == '' && $('#updateFormCateTitle').css('display') == 'none') {
										$('#updateFormCateTitle').animate({
											height: 'toggle',
											opacity: 'toggle'
										}, "slow");
										$("#updateFormCateTitle").show().find(':input').attr('disabled', false);
									}

									if (form.cateOid.value != '' && $('#updateFormCateTitle').css('display') == 'block') {
										$('#updateFormCateTitle').animate({
											height: 'toggle',
											opacity: 'toggle'
										}, "slow");
										$("#updateFormCateTitle").show().find(':input').attr('disabled', 'disabled');
									}
									$('#addForm').validator('destroy'); // 先销毁验证规则
									util.form.validator.init($('#addForm')); // 然后添加验证规则
								});
								
								$(cateType).val(row.cateType).change();
								
								$(form.indicateDataType).off().on('change', function() {
									var v = $(this).val();
									if('NUMBER' === v || 'NUMRANGE' === v) {
										$(form.indicateDataUnit).removeAttr('disabled');
										$('#updateDataUnitDiv').fadeIn();
									} else {
										$(form.indicateDataUnit).attr('disabled', 'disabled');
										$('#updateDataUnitDiv').fadeOut();
									}									
								});
								$(form.indicateDataType).val(row.indicateDataType).change();

								$$.formAutoFix($('#updateForm'), row);
								
								$('#updateForm').validator('destroy');
								util.form.validator.init($('#updateForm'));
							});

						},
						'click .item-enable': function(e, value, row) {
							$("#enableConfirmTitle").html("确定启用风险指标配置？");
							$$.confirm({
								container: $('#enableModal'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.config.ccr.indicate.enable, {
										data: {
											oid: row.indicateOid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							})
						},
						'click .item-disable': function(e, value, row) {
							$("#disableConfirmTitle").html("确定禁用风险指标配置？");
							$$.confirm({
								container: $('#disableModal'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.config.ccr.indicate.disable, {
										data: {
											oid: row.indicateOid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							})
						},
						'click .item-delete': function(e, value, row) {
							$("#deleteConfirmTitle").html("确定删除风险指标配置？");
							$$.confirm({
								container: $('#deleteModal'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.config.ccr.indicate.delete, {
										data: {
											oid: row.indicateOid
										},
										contentType: 'form'
									}, function(result) {
										$('#dataTable').bootstrapTable('refresh');
									})
								}
							})
						}
					}
				}]

			});

			$$.searchInit($('#searchForm'), $('#dataTable'));

			$('#eventAdd').on('click', function() {

				http.post(config.api.system.config.ccr.cate.options, {
					data: {},
					contentType: 'form'
				}, function(val) {
					$.each(val, function(key, value) {
						value.push({
							oid: '',
							type: key,
							title: '其他'
						});
					});
					$('#addForm').resetForm();
					$('#addModal').modal('show');
					var form = document.addForm;
					var cateType = form.cateType;
					$(cateType).off().on('change', function() {
						if (!val[cateType.value]) {
							val[cateType.value] = [{
								oid: '',
								title: '其他',
								type: cateType.value
							}];
						}

						$(form.cateOid).empty();
						$.each(val[cateType.value], function(i, v) {
							$(form.cateOid).append('<option value="' + v.oid + '">' + v.title + '</option>')
						});

						$(form.cateOid).change();
					});

					$(form.cateOid).off().on('change', function() {

						if (form.cateOid.value == '' && $('#addFormCateTitle').css('display') == 'none') {
							$('#addFormCateTitle').animate({
								height: 'toggle',
								opacity: 'toggle'
							}, "slow");
							$("#addFormCateTitle").show().find(':input').attr('disabled', false);
						}

						if (form.cateOid.value != '' && $('#addFormCateTitle').css('display') == 'block') {
							$('#addFormCateTitle').animate({
								height: 'toggle',
								opacity: 'toggle'
							}, "slow");
							$("#addFormCateTitle").show().find(':input').attr('disabled', 'disabled');
						}
						$('#addForm').validator('destroy'); // 先销毁验证规则
						util.form.validator.init($('#addForm')); // 然后添加验证规则
					});

					$(cateType).change();

					$(form.indicateDataType).off().on('change', function() {
						var v = $(this).val();
						if('NUMBER' === v || 'NUMRANGE' === v) {
							$(form.indicateDataUnit).removeAttr('disabled');
							$('#addDataUnitDiv').fadeIn();
						} else {
							$(form.indicateDataUnit).attr('disabled', 'disabled');
							$('#addDataUnitDiv').fadeOut();
						}									
					});
					$(form.indicateDataType).change();
					$('#addForm').validator('destroy');
					util.form.validator.init($('#addForm'));
				});
			});

			$('#saveButton').on('click', function() {
				if (!$('#addForm').validator('doSubmitCheck')) return
				$('#addForm').ajaxSubmit({
					url: config.api.system.config.ccr.indicate.save,
					success: function(result) {
						if(result.errorCode && result.errorCode != 0){
							errorHandle(result);
						}else{
							$('#addForm').resetForm();
							$('#addModal').modal('hide');
							$('#dataTable').bootstrapTable('refresh');
						}
					}
				})
			});

			$('#updateButton').on('click', function() {
				if (!$('#updateForm').validator('doSubmitCheck')) return
				$('#updateForm').ajaxSubmit({
					url: config.api.system.config.ccr.indicate.save,
					success: function(result) {
						if(result.errorCode && result.errorCode != 0){
							errorHandle(result);
						}else{
							$('#updateForm').resetForm();
							$('#updateModal').modal('hide');
							$('#dataTable').bootstrapTable('refresh');
						}
					}
				})
			});


		}
	}
})