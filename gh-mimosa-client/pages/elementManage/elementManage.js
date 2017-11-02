define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'elementManage',
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			pagesInit: function() {
				var _this = this;

				var eleOptions = {
					number: 1,
					size: 10,
					offset: 0,
					name: '',
					code: '',
					type: '',
					isDispaly: ''
				}
				var confirm = $('#confirmModal');

				var eleConfig = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.element.list, {
							page: eleOptions.number,
							rows: eleOptions.size,
							name: eleOptions.name,
							code: eleOptions.code,
							type: eleOptions.type,
							isDisplay: eleOptions.isDisplay
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getEleQueryParams,
					onClickCell: function(field, value, row, $element) {
						switch(field) {
							case 'name':
								toDetail(value, row)
						}
					},
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return eleOptions.offset + index + 1
						}
					}, {
						field: 'code',
						align: 'left'
					}, {
						field: 'name',
						class: 'table_title_detail',
						align: 'left'
					}, {
						field: 'type',
						formatter: function(val, row, index) {
							return util.enum.transform('elementTypes', val);
						},
						align: 'left'
					}, {
						field: 'isDisplay',
						align: 'left',
						formatter: function(val, row, index) {
							return util.enum.transform('isDisplays', val);
						}
					}, {
						field: 'updateTime',
						align: 'right'
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = [{
								text: '显示',
								type: 'button',
								class: 'item_on',
								isRender: row.isDisplay == 'no'
							},{
								text: '关闭',
								type: 'button',
								class: 'item_off',
								isRender: row.isDisplay == 'yes' && row.type == 'button'
							}];
							var but = util.table.formatter.generateButton(buttons, 'elementTable');
							var updateStr = '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item_update"></span>';
							var deleteStr = '';//'<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item_delete"></span>';
							return but+updateStr + deleteStr;
						},
						events: {
							'click .item_on': toOn,
							'click .item_off': toOff,
							'click .item_update': toUpdate,
							'click .item_delete': toDelete
						}
					}]
				}

				$('#elementTable').bootstrapTable(eleConfig);
				$$.searchInit($('#eleSearchForm'), $('#elementTable'));
				util.form.validator.init($('#addEleForm'));

				// 显示元素
				function toOn(e, value, row){
					$('#confirmModal').find('p').html("确定显示该元素?")
					$$.confirm({
						container: $('#confirmModal'),
						trigger: this,
						accept: function() {
							http.post(config.api.element.on, {
								data: {
									oid: row.oid
								},
								contentType: 'form',
							}, function(res) {
								$('#elementTable').bootstrapTable('refresh')
							})
						}
					})
				}
				// 关闭元素
				function toOff(e, value, row){
					$('#confirmModal').find('p').html("确定关闭该元素?")
					$$.confirm({
						container: $('#confirmModal'),
						trigger: this,
						accept: function() {
							http.post(config.api.element.off, {
								data: {
									oid: row.oid
								},
								contentType: 'form',
							}, function(res) {
								$('#elementTable').bootstrapTable('refresh')
							})
						}
					})
				}
				//查询
				function getEleQueryParams(val) {
					var form = document.eleSearchForm
						// 分页数据赋值
					eleOptions.size = val.limit
					eleOptions.number = parseInt(val.offset / val.limit) + 1
					eleOptions.offset = val.offset
					eleOptions.code = form.code.value.trim()
					eleOptions.name = form.name.value.trim()
					eleOptions.type = form.type.value.trim()
					eleOptions.isDisplay = form.isDisplay.value.trim()
					return val
				}

				// 新建按钮点击事件
				$('#addEle').on('click', function() {
					util.form.reset($('#addEleForm'))
					$('#addEleForm').validator('destroy')
					util.form.validator.init($('#addEleForm'));
					$('#addEleModal').modal('show')
				})

				// 新建用户 - 确定按钮点击事件
				$('#doAddEle').on('click', function() {

					if(!$('#addEleForm').validator('doSubmitCheck')) return
					
					var addCode = $("#addCode").val();
					http.post(config.api.element.checkCode, {
							data: {
								code: addCode
							},
							contentType: 'form',
						}, function(result) {
//							console.log(result);
							submitAdd();
						})
				})
				
				function submitAdd(){
					$('#addEleForm').ajaxSubmit({
						url: config.api.element.add,
						success: function(result) {
							if(result.errorCode == 0) {
								util.form.reset($('#addEleForm'))
								$('#elementTable').bootstrapTable('refresh')
								$('#addEleModal').modal('hide')
							} else {
								errorHandle(result);
							}
						}
					})
				}

				//获取详情
				function toDetail(value, row) {
					$$.detailAutoFix($('#detailForm'), row); // 自动填充详情	
					$('#detailModal').modal('show');
				}

				//修改
				function toUpdate(e, value, row) {
					//重置验证
					$('#updateEleForm').validator('destroy')
					util.form.validator.init($('#updateEleForm'));

					$$.formAutoFix($('#updateEleForm'), row); // 自动填充详情
					
					if (row.type == "link" || row.type == "data"){
						$("#editIsDisplay").hide();
						$(document.updateEleForm.isDisplay).val("yes");
					}else{
						$("#editIsDisplay").show();
					}

					$('#updateEleModal').modal('show');
				}
				// 删除
				function toDelete(e, value, row) {
					$('#confirmModal').find('p').html("确定删除这条数据?")
					$$.confirm({
						container: $('#confirmModal'),
						trigger: this,
						accept: function() {
							http.post(config.api.element.delete, {
								data: {
									oid: row.oid
								},
								contentType: 'form',
							}, function(res) {
								$('#elementTable').bootstrapTable('refresh')
							})
						}
					})
				}
				
				// 修改 - 确定按钮点击事件
				$('#doUpdateEle').on('click', function() {
					if(!$('#updateEleForm').validator('doSubmitCheck')) return
					
					$('#updateEleForm').ajaxSubmit({
						url: config.api.element.update,
						success: function(result) {
							if(result.errorCode == 0) {
								util.form.reset($('#updateEleForm'))
								$('#elementTable').bootstrapTable('refresh')
								$('#updateEleModal').modal('hide')
							} else {
								errorHandle(result);
							}
						}
					})
				})
			},
			bindEvent: function() {
				var _this = this;
				
				$(document.addEleForm.type).change(function(){
					console.log($(this).val());
					var type = $(this).val();
					if (type == "link" || type == "data"){
						$("#addIsDisplay").hide();
						$(document.addEleForm.isDisplay).val("yes");
					}else{
						$("#addIsDisplay").show();
					}
				});
				
				$(document.updateEleForm.type).change(function(){
					console.log($(this).val());
					var type = $(this).val();
					if (type == "link" || type == "data"){
						$("#editIsDisplay").hide();
						$(document.updateEleForm.isDisplay).val("yes");
					}else{
						$("#editIsDisplay").show();
					}
				});
			}
		}
	})