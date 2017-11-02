define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'bankCard',
			init: function() {
				var operating = {
					operateType: '',
					row: {}
				}
				var offTable = []
				var onTable = []
				var pageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					bankName: '',
					status: ''
				}
				var tableConfig = {
					ajax: function(origin) {
						http.post(config.api.bankCard.query, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								title: pageOptions.title,
								bankName: pageOptions.bankName,
								status: pageOptions.status
							},
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					},
					pagination: true,
					sidePagination: 'server',
					queryParams: getQueryParams,
					 onClickCell: function (field, value, row, $element) {
					  switch (field) {
				        case 'bankName':
				        	queryInfo(value,row)
				        	break
				        case 'bankLogo':
				        case 'bankBigLogo':
				        	viewImage(value,row)
				        	break
						}
					},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return pageOptions.offset + index + 1
						}
					}, {
						field: 'bankCode',
					}, {
						field: 'bankName',
						class: 'table_title_detail'
					}, {
						field: 'peopleBankCode',
						align: 'right'
					}, {
						field: 'bgColor',
					}, {
						field: 'bankLogo',
						align: 'center',
						formatter: function(val) {
							return util.table.formatter.thumbImg(val)
						}
					}, {
						field: 'bankBigLogo',
						align: 'center',
						formatter: function(val) {
							return util.table.formatter.thumbImg(val)
						}
					}, {
						field: 'withdrawOneLimit',
						class: 'decimal0',
						align: 'right',
						formatter: function(val) {
							if (val == 0){
								return "无限制";
							}else{
								return val;
							}
						}
					}, {
						field: 'payOneLimit',
						class: 'decimal0 align-right',
						formatter: function(val) {
							if (val == 0){
								return "无限制";
							}else{
								return val;
							}
						}
					}, {
						field: 'withdrawDayLimit',
						class: 'decimal0',
						align: 'right',
						formatter: function(val) {
							if (val == 0){
								return "无限制";
							}else{
								return val;
							}
						}
					}, {
						field: 'payDayLimit',
						class: 'decimal0 align-right',
						formatter: function(val) {
							if (val == 0){
								return "无限制";
							}else{
								return val;
							}
						}
					}, {
						field: 'withdrawMoonLimit',
						class: 'decimal0',
						align: 'right',
						formatter: function(val) {
							if (val == 0){
								return "无限制";
							}else{
								return val;
							}
						}
					}, {
						field: 'payMoonLimit',
						class: 'decimal0 align-right',
						formatter: function(val) {
							if (val == 0){
								return "无限制";
							}else{
								return val;
							}
						}
					}, {
						field: 'status',
						formatter: function(val) {
							return util.enum.transform('approveStatus', val);
						}
//					}, {
//						field: 'approver',
//						formatter: function(val, row, index) {
//							return null == val ? '--' : val;
//						}
//					}, {
//						field: 'approveTime',
//						formatter: function(val, row, index) {
//							return null == row.approveTime ? '--' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
//						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = [{
								text: '审核',
								type: 'button',
								class: 'item-approve',
								isRender: row.status == 'toApprove'
							}]
							var format = util.table.formatter.generateButton(buttons, 'bannerTable')
			            	if(row.status == 'pass' || row.status == 'refused'){
			            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
			            		+'<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
			            	}
			            	return format;
						},
						events: {
							'click .item-detail': function(e, value, row) {
								
							},
							'click .item-update': function(e, value, row) {
								//去除重复提交样式
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');

								$('#picForm').clearForm()
								$('#createForm').clearForm().find('input[type=hidden]').val('');
								$('#bankCode').attr('readOnly','readOnly');
								operating.operateType = 'update';
								operating.row = row
								$$.formAutoFix($('#createForm'), row)
								
								 // 编辑时展示图片
                				showTablePic(true, row.bankLogo, row.bankBigLogo);
								
								var picForm = document.picForm;
								var createForm = document.createForm;
								$(picForm.pic1).removeAttr('required');
								$(picForm.pic2).removeAttr('required');
								
								$(createForm).validator('destroy')
								$(picForm).validator('destroy')
								
								$(createForm).validator('validate')
								$(picForm).validator('validate')
								
								$('#createModal').modal('show').find('.modal-title').html('修改')
							},
							'click .item-delete': function(e, value, row) {
								$('#confirmDiv').find('p').html('确定删除此条数据?')
								$$.confirm({
									container: $('#confirmDiv'),
									trigger: this,
									accept: function() {
										http.post(config.api.bankCard.delete, {
											data: {
												oid: row.oid
											},
											contentType: 'form',
										}, function(result) {
											$('#bannerTable').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-approve': function(e, value, row) {
								var form = document.approveForm;
								$(form).validator('destroy')
								util.form.validator.init($(form));
								$('#approveForm').clearForm();
								form.oid.value = row.oid;
								$('#bannerTitle').html(row.bankName);
								$('#approvetModal').modal('show');
							}
						}
					}]
				}
				function queryInfo(value,row){
					$$.detailAutoFix($('#detailForm'), row); // 自动填充详情
					$('#detailImageUrl1').attr('src', row.bankLogo);
					$('#detailImageUrl2').attr('src', row.bankBigLogo);
//					$('#updateTime').html(null == row.updateTime ? '--' : util.table.formatter.timestampToDate(row.updateTime, 'YYYY-MM-DD HH:mm:ss'))
//					$('#approveTime').html(null == row.approveTime ? '--' : util.table.formatter.timestampToDate(row.approveTime, 'YYYY-MM-DD HH:mm:ss'))
//					$('#releaseTime').html(null == row.releaseTime ? '--' : util.table.formatter.timestampToDate(row.releaseTime, 'YYYY-MM-DD HH:mm:ss'))
//					$('#detailRemark').val(row.remark);
					$('#detailModal').modal('show')
				}

				$('#bannerTable').bootstrapTable(tableConfig)
				$$.searchInit($('#searchForm'), $('#bannerTable'))

				util.form.validator.init($('#createForm'))
				util.form.validator.init($('#picForm'))
				util.form.validator.init($('#approveForm'))

				//新建页面
				$('#createBanner').on('click', function() {
					//添加表单验证初始化
					var form = document.createForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
		
					var picForm = document.picForm
					$(picForm.pic1).attr('required', true);
					$(picForm.pic2).attr('required', true);
					$(picForm).validator('destroy')
					util.form.validator.init($(picForm));

					$('#bankCode').removeAttr('readOnly');
					
					//去除重复提交样式
					$('#refreshDiv').removeClass('overlay');
					$('#refreshI').removeClass('fa fa-refresh fa-spin');
					operating.operateType = 'add';
					$('#createForm').clearForm().find('input[type=hidden]').val('')
					$('#picForm').clearForm()

					util.form.reset($('#createForm'))
					util.form.reset($('#picForm'))
					// 新增时展示图片
					showTablePic(false);
					$('#createModal').modal('show').find('.modal-title').html('新建银行卡')
				})

				//新建提交
				$('#createSubmit').on('click', function() {
					if(!$('#createForm').validator('doSubmitCheck')) return
					 // 图片校验
           			if (!$('#picForm').validator('doSubmitCheck')) return
           			
           			if ($(document.picForm.pic1).attr('required') == 'required' && $(document.picForm.pic2).attr('required') == 'required') {
					  	if (!document.picForm.pic1.value && !document.picForm.pic2.value) {
					  		toastr.error("请选择需要上传的图片", '错误信息', {
										timeOut: 3000
							})
					  	}
					  	var filename1 = document.picForm.pic1.value;
						var filename2 = document.picForm.pic2.value;
						//文件后缀名截取
						var postf1 = util.getSuffixName(filename1);
						var postf2 = util.getSuffixName(filename2);
						if((postf1.toLowerCase() == ".jpg" || postf1.toLowerCase() == ".png") && (postf2.toLowerCase() == ".jpg" || postf2.toLowerCase() == ".png")) {
							//添加重复提交样式
							$('#refreshDiv').addClass('overlay');
							$('#refreshI').addClass('fa fa-refresh fa-spin');
							
							$('#picForm').ajaxSubmit({
								url: config.api.yup,
								success: function(picResult) {
									document.createForm.bankLogo.value = '/' + picResult[0].url;
									document.createForm.bankBigLogo.value = '/' + picResult[1].url
									bankCardFormSubmit()
								}
							})
						} else {
							toastr.error("图片格式仅限JPG、PNG", '错误信息', {
								timeOut: 3000
							})
							return false;
						}
					} else if ($(document.picForm.pic1).attr('required') == 'required') {
						if (!document.picForm.pic1.value) {
					  		toastr.error("请选择需要上传的图片", '错误信息', {
										timeOut: 3000
							})
					  	}
						
						var filename1 = document.picForm.pic1.value;
						//文件后缀名截取
						var postf1 = util.getSuffixName(filename1);
						if(postf1.toLowerCase() == ".jpg" || postf1.toLowerCase() == ".png") {
							//添加重复提交样式
							$('#refreshDiv').addClass('overlay');
							$('#refreshI').addClass('fa fa-refresh fa-spin');
							
							$('#picForm').ajaxSubmit({
								url: config.api.yup,
								success: function(picResult) {
									document.createForm.bankLogo.value = '/' + picResult[0].url;
									bankCardFormSubmit()
								}
							})
						} else {
							toastr.error("图片格式仅限JPG、PNG", '错误信息', {
								timeOut: 3000
							})
							return false;
						}
					
					} else if ($(document.picForm.pic2).attr('required') == 'required') {
						
						var filename2 = document.picForm.pic2.value;
						//文件后缀名截取
						var postf2 = util.getSuffixName(filename2);
						if(postf2.toLowerCase() == ".jpg" || postf2.toLowerCase() == ".png") {
							//添加重复提交样式
							$('#refreshDiv').addClass('overlay');
							$('#refreshI').addClass('fa fa-refresh fa-spin');
							
							$('#picForm').ajaxSubmit({
								url: config.api.yup,
								success: function(picResult) {
									document.createForm.bankBigLogo.value = '/' + picResult[0].url
									bankCardFormSubmit()
								}
							})
						} else {
							toastr.error("图片格式仅限JPG、PNG", '错误信息', {
								timeOut: 3000
							})
							return false;
						}
					
					} else {
						bankCardFormSubmit();
					}
           			
				})

				function bankCardFormSubmit() {
					$('#refreshDiv').addClass('overlay');
					$('#refreshI').addClass('fa fa-refresh fa-spin');
					var url = '';
					if(operating.operateType === 'update') {
						url = config.api.bankCard.update
					} else {
						url = config.api.bankCard.add
					}
					$('#createForm').ajaxSubmit({
						url: url,
						success: function(result) {
							if(result.errorCode == 0) {
								$('#createModal').modal('hide')
								$('#bannerTable').bootstrapTable('refresh')
							} else {
								errorHandle(result);
								//去除重复提交样式
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');
							}
						}
					})
				}

				// 编辑展示图片
		      	function showTablePic(isShow, imgUrl1, imgUrl2) {
		      		if (isShow) {
		      		  	$('#editImageUrl1').attr('src', imgUrl1);
		      		  	$('#editImageUrl2').attr('src', imgUrl2);
		            	$('#bankCardPicTable1').show();
		            	$('#bankCardPicTable2').show();
		            	$('#picDiv1').hide();
		            	$('#picDiv2').hide();
		      		} else {
		      			$('#editImageUrl1').attr('src', '');
		      			$('#editImageUrl2').attr('src', '');
		            	$('#bankCardPicTable1').hide();
		            	$('#bankCardPicTable2').hide();
		           		$('#picDiv1').show();
		           		$('#picDiv2').show();
		      		}
		      	}
						
				//审核意见
				function submitRemark() {
					if(!$('#approveForm').validator('doSubmitCheck')) return

					$('#approveForm').ajaxSubmit({
						url: config.api.bankCard.dealapprove,
						success: function(result) {
							if(result.errorCode == 0) {
								$('#approvetModal').modal('hide')
								$('#bannerTable').bootstrapTable('refresh')
							} else {
								errorHandle(result);
							}
						}
					})
				}
				
				// 隐藏编辑展示的图片，原上传按钮展示出来
		      	$('#picDelButton1').on('click', function () {
			      	$('#editImageUrl1').attr('src', '');
		          	$('#bankCardPicTable1').hide();
		          
		          	var picForm = document.picForm
		          	$(picForm.pic1).attr('required', true);
					$(picForm).validator('destroy')
					util.form.validator.init($(picForm));
		          
		         	 $('#picDiv1').show();
		     	})
		      	
		      	// 隐藏编辑展示的图片，原上传按钮展示出来
		      	$('#picDelButton2').on('click', function () {
			      	$('#editImageUrl2').attr('src', '');
		          	$('#bankCardPicTable2').hide();
		          
		          	var picForm = document.picForm
		          	$(picForm.pic2).attr('required', true);
					$(picForm).validator('destroy')
					util.form.validator.init($(picForm));
		          
		         	 $('#picDiv2').show();
		     	})

				$('#refusedBut').on('click', function() {
					document.approveForm.approveStatus.value = 'refused';
					submitRemark();
				})

				$('#passBut').on('click', function() {
					document.approveForm.approveStatus.value = 'pass';
					submitRemark();
				})

				$('#createReset').on('click', function() {
					var form = document.createForm
					if(operating.operateType === 'update') {
						$$.formAutoFix($('#createForm'), operating.row)
						showTablePic(true, operating.row.bankLogo, operating.row.bankBigLogo);
          
			            var picForm = document.picForm;
			            $(picForm.pic1).removeAttr('required');
			            $(picForm.pic2).removeAttr('required');
						$(picForm).validator('destroy')
			            picForm.reset()
			          
			            $(form).validator('validate')
			            $(picForm).validator('validate')
					} else {
						document.createForm.reset()
						document.picForm.reset()
						$(form).validator('validate')
					}
				})

				function getQueryParams(val) {
					var form = document.searchForm
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.bankName = form.bankName.value.trim()
					pageOptions.status = form.status.value
					return val
				}
				function viewImage(value,row){
			      	$('#viewImage').attr('src',value)  
			      	$('#viewModal').modal('show')
			      }
			}
		}
	})