
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'mailapprove',
			approveInfo: {
				apprOid: '',
				apprResult: ''
			},
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			pagesInit: function() {
				var _this = this;
				
				var mailOptions = {
					number: 1,
					size: 10,
					offset: 0,
					phone: '',
					status: 'toApprove',
					mailType: '',
					createTimeBegin: '',
					createTimeEnd: ''
				}
				var confirm = $('#confirmModal');
				
				var mailConfig = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.mail.queryPage, {
							page: mailOptions.number,
							rows: mailOptions.size,
							phone: mailOptions.phone,
							createTimeBegin: mailOptions.createTimeBegin,
							createTimeEnd: mailOptions.createTimeEnd,
							status: mailOptions.status,
							mailType: mailOptions.mailType
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getMailParams,
					onClickCell: function (field, value, row, $element) {
					  	switch (field) {
			        		case 'mesTitle':toMailDetail(value,row)
					  	}
					},
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return mailOptions.offset + index + 1
						}
					}, {
						field: 'mailType',
						align: 'left',
						formatter: function(val, row, index) {
							return util.enum.transform('mailTypes', val);
						}
					}, {
						field: 'phone',
						align: 'right',
						formatter: function(val, row, index) {
							if (!val || val === undefined || val === ''){
								return '--';
							}
							return val;
						}
					}, {
						field: 'mesType',
						align: 'left',
						formatter: function(val, row, index) {
							return util.enum.transform('mesTypes', val);
						}
					}, {
						field: 'mesTitle',
						align: 'left',
						class: 'table_title_detail'
					}, {
						field: 'requester',
						align: 'left',
					}, {
						field: 'createTime',
						align: 'right',
						formatter: function(val, row, index) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = [{
								text: '通过',
								type: 'buttonGroup',
								class: 'item-confirm" data-type="pass"',
//								isCloseBottom: index >= $('#siteApproveTable').bootstrapTable('getData').length - 1,
								sub: [{
									text: '驳回',
									class: 'item-confirm" data-type="refused"',
									isRender: true
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'mailTable');
						},
						events: {
							'click .item-confirm': toConfirm
						}
					}]
				}
				
				$('#mailTable').bootstrapTable(mailConfig);
				$$.searchInit($('#mailSearchForm'), $('#mailTable'));
				
				
				//审核
				function toConfirm(e, value, row) {
					// 重置和初始化表单验证
					$("#approveForm").validator('destroy')
					util.form.validator.init($("#approveForm"));

					$('#approveForm').clearForm().find('input[type=hidden]').val('')
					$("#content").html($(this).html());
					_this.approveInfo.apprOid = row.oid;
					_this.approveInfo.apprResult = $(this).attr('data-type');
					$('#approvetModal').modal('show');
				}
				
				//查询
				function getMailParams(val) {
					var form = document.mailSearchForm
					// 分页数据赋值
					mailOptions.size = val.limit
					mailOptions.number = parseInt(val.offset / val.limit) + 1
					mailOptions.offset = val.offset
					mailOptions.phone = form.phone.value.trim()
					mailOptions.createTimeBegin = form.createTimeBegin.value.trim()
					mailOptions.createTimeEnd = form.createTimeEnd.value.trim()
					mailOptions.createTimeEnd = getNextDate(mailOptions.createTimeEnd)
					mailOptions.mailType = form.mailType.value.trim()
					return val
				}
				
				function getNextDate(val){
					if (val && val!=''){
						var now = new Date(val);
						var next = now.getTime()+24*60*60*1000;
						var nextDate = util.table.formatter.timestampToDate(next, 'YYYY-MM-DD');
						return nextDate;
					}else{
						return val;
					}
				}
				
				
				//站内信详情
				function toMailDetail(value, row) {
					$$.detailAutoFix($('#remarkModal'), row);
					$('#remarkModal').modal('show');
				}
			},
			bindEvent: function() {
				var _this = this;
				
				//审批操作按钮
				$("#approveBut").on('click', function() {
					if (!$('#approveForm').validator('doSubmitCheck')) return
					document.approveForm.aoid.value = _this.approveInfo.apprOid;
					document.approveForm.approveResult.value = _this.approveInfo.apprResult;
					$('#approveForm').ajaxSubmit({
						url: config.api.mail.approve,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#approvetModal').modal('hide')
								$('#mailTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				})
			}
		}
	})