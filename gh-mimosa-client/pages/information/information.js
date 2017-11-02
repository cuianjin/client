define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'information',
    init: function (){
	  	var _this = this;
	  	_this.pagesInit();
	  	_this.bindEvent();
	  	
      CKEDITOR.replace( 'editoraction1' );
      CKEDITOR.replace( 'content' );
	  },
	  operating : {
        operateType: '',
        row: {}
   },
	  pagesInit: function () {
	  	var _this = this;
		  // 分页配置
		  var pageOptions = {
        number: 1,
        size: 10,
        offset: 0,
        channelOid:'',
        title:'',
        status:'',
        type:''
      }
		  var pageOptions2 = {
        number: 1,
        size: 10,
        offset: 0
      }
		  var pageOptions1 = {    
      	number: 1,
		    size: 10,
		    offset: 0,
        imgName: '',
        reqTimeBegin: '',
        reqTimeEnd: ''
      }
		  var confirm = $('#confirmModal');
		  // 数据表格配置
		  var tableConfig = {
				ajax: function (origin) {
          http.post(config.api.informationGetList, {
            data: {
              page: pageOptions.number,
              rows: pageOptions.size,
              channelOid: pageOptions.channelOid,
              title: pageOptions.title,
              status: pageOptions.status,
              type: pageOptions.type
            },
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        idField:'oid',
		    pagination: true,
		    sidePagination: 'server',
		    pageList: [10, 20, 30, 50, 100],
		    queryParams: getQueryParams,
		     onClickCell: function (field, value, row, $element) {
				  switch (field) {
		        case 'title':
		        	queryInfo(value,row)
		        	break
				  }
				},
        columns: [
          {
             width: 30,
		        align: 'center',
		        formatter: function (val, row, index) {
		          return pageOptions.offset + index + 1
		        }
          },
          {
            field: 'title',
            class: 'table_title_detail'
          },
          {
            field: 'type',
          },
          {
            field: 'isHome',
            formatter: function (val) {
            	return util.enum.transform('topInfoStatus', val);
            }
          },
          {
            field: 'status',
            formatter: function (val) {
            	return util.enum.transform('informationStatus', val);
            }
          },
          {
            field: 'publishTime',
            class: 'align-right',
            formatter: function (val, row, index) {
              return (undefined == val ||val==null)?'-':util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            field: 'url',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'publisher',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },

          {
          	align: 'center',
            formatter: function (val, row, index) {
            	var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#informationTable').bootstrapTable('getData').length - 1,
									sub:[{
			            		text: '审核',
			            		type: 'button',
			            		class: 'item-review',
			            		isRender: row.status=='pending'
			            	},{
			            		text: '发布',
			            		type: 'button',
			            		class: 'item-publish',
			            		isRender: row.status=='publishing'||row.status=='off'
			            	},
			            	{
			            		text: '下架',
			            		type: 'button',
			            		class: 'item-off',
			            		isRender: row.status=='published'
			            	},
			            	{
			            		text: '推荐',
			            		type: 'button',
			            		class: 'item-isHome',
			            		isRender: row.isHome==0&&row.status=='published'
			            	},{
			            		text: '取消推荐',
			            		type: 'button',
			            		class: 'item-isHome',
			            		isRender: row.isHome==1&&row.status=='published'
			            	}]
								}]
            	var format = util.table.formatter.generateButton(buttons, 'informationTable')
            	if(row.status=='pending'||row.status=='reject'||row.status=='off' ){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
            		
            	}
            	if(row.status!='published'){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
            	}
            	return format;
            },
            events: {
              'click .item-detail': function (e, value, row) {
								
              },
              'click .item-update': function (e, value, row) {
              	//去除重复提交样式
								$('#refreshDiv1').removeClass('overlay');
								$('#refreshI1').removeClass('fa fa-refresh fa-spin');
								$('#refreshDiv2').removeClass('overlay');
								$('#refreshI2').removeClass('fa fa-refresh fa-spin');
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');
              	_this.operating.operateType = 'update';
              	$('#picForm1').clearForm();
              	$('#picForm2').clearForm();
              	document.create1Form.oid.value = row.oid
              	document.create2Form.oid.value = row.oid
								http.post(config.api.informationInfo, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form'
               }, function (result) {
                	_this.operating.row = result;
                	$(".presentation").removeClass("active")
                	$(".tab-pane").removeClass("active");
                	$$.formAutoFix($('#create1Form'), result); // 自动填充详情
	              	$('#create1Form').validator('validate')
	              	$$.formAutoFix($('#create2Form'), result); // 自动填充详情
	              	$('#create2Form').validator('validate')
						      CKEDITOR.instances.editoraction1.setData(row.content || '<p></p>');
                	if(row.url){
                		$("#li1").addClass("active")
                		$("#tabcon1").addClass("active")
                	}else{
                		$("#li2").addClass("active")
                		$("#tabcon2").addClass("active")
                	}
                })
								$('#createModal').modal('show')
								.find('.modal-title').html("修改资讯");
								
              },
              'click .item-delete': function (e, value, row) {
                $$.confirm({
                  container: $('#deleteConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.informationDelete, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#informationTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
              'click .item-isHome': function (e, value, row) {
                http.post(config.api.informationIsHome, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                   }, function (result) {
                      $('#informationTable').bootstrapTable('refresh')
                    })
              },
              'click .item-review': function (e, value, row) {
              	var approveForm = document.approveForm
								$(approveForm).validator('destroy')
								util.form.validator.init($(approveForm));
							  $('#approveForm')
							    .clearForm()
					        .find('input[type=hidden]').val('')

								$('#approvetModal').modal('show');
								document.approveForm.oid.value=row.oid;
              },
              'click .item-publish': function (e, value, row) {
               $$.confirm({
                  container: $('#publishConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.informationPubilsh, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#informationTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
              'click .item-off': function (e, value, row) {
               $$.confirm({
                  container: $('#offConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.informationOff, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#informationTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
            }
          }
        ]
      }
		  function queryInfo(value,row){
		  	http.post(config.api.informationInfo, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form'
                }, function (result) {
                  $$.detailAutoFix($('#detailForm'), result); // 自动填充详情

                  $("#thumbnailUrlDetail").attr('src', result.thumbnailUrl);
                  $("#summary").text(result.summary);
                  CKEDITOR.instances.content.setData(result.content || '<p></p>');
                  $("#createTimeDetail").text(result.createTime==null?'--':util.table.formatter.timestampToDate(result.createTime, 'YYYY-MM-DD HH:mm:ss'));
                  $("#reviewTimeDetail").text(result.reviewTime==null?'--':util.table.formatter.timestampToDate(result.reviewTime, 'YYYY-MM-DD HH:mm:ss'));
                  $("#reviewRemarkDetail").text(result.reviewRemark);
                  $("#publishTimeDetail").text(result.publishTime==null?'--':util.table.formatter.timestampToDate(result.publishTime, 'YYYY-MM-DD HH:mm:ss'));
                })
                $('#detailModal').modal('show')
		  }

      var tableConfig2 = {
        ajax: function (origin) {
          http.post(config.api.informationTypeList, {
            data: {},
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        pageNumber: pageOptions2.number,
        pageSize: pageOptions2.size,
        pagination: false,
        sidePagination: 'server',
        columns: [
          {
            field: 'sort',
            width: 40,
            formatter: function (val, row, index) {
              return val > 0 ? val : '--'
            }
          },
          {
            field: 'name',
          },
          {
          	align: 'center',
            formatter: function (val, row) {
//          	var buttons = [{
//          		text: '上移',
//          		type: 'button',
//          		class: 'item-up',
//          		isRender: row.status==1
//          	},{
//          		text: '下移',
//          		type: 'button',
//          		class: 'item-down',
//          		isRender: row.status==1
//          	},{
//          		text: '启用',
//          		type: 'button',
//          		class: 'item-start',
//          		isRender: row.status==0
//          	}
//          	,{
//          		text: '关闭',
//          		type: 'button',
//          		class: 'item-start',
//          		isRender: row.status==1
//          	},{
//          		text: '删除',
//          		type: 'button',
//          		class: 'item-delete',
//          		isRender: row.status==0
//          	}]
            		var buttons = [{
            		text: '启用',
            		type: 'button',
            		class: 'item-start',
            		isRender: row.status==0
            	},{
            		text: '关闭',
            		type: 'button',
            		class: 'item-start',
            		isRender: row.status==1
            	}]
            	var format = ''
            	if(row.status==1){
            		format+= '<i class="fa fa-arrow-circle-o-up item-up"></i><i class="fa fa-arrow-circle-o-down item-down"></i>';
            	}
            	format += util.table.formatter.generateButton(buttons, 'informationTypeTable');
            	if(row.status==0){
            		format+= '<i style=" margin:auto 0px auto 10px;vertical-align: middle;" class="fa fa-trash-o item-delete information_del"></i>';
            	}
            	return format;
            },
            events: {
              'click .item-up': function (e, value, row) {
                http.post(config.api.sortInfoTypeUp, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form',
                }, function (result) {
                  $('#informationTypeTable').bootstrapTable('refresh')
                })
              },
              'click .item-start': function (e, value, row) {
              	var confrimId='';
              	if(row.status==0){
              		confrimId='#onTypeConfirm';
              	}else{
              		confrimId='#offTypeConfirm';
              	}
              	$$.confirm({
                  container: $(confrimId),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.dealInfoTypeStatus, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                     if(result.errorCode==0){
		                      //资讯类型下拉列表
								          http.post(config.api.infoTypeSelect, {
								               contentType: 'form'
								          }, function (enums) {
								              for (var key in enums) {
								                 config[key] = enums[key]
								              }
								              $$.enumSourceInit($(document))
								          })
                     }
                     $('#informationTypeTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
              'click .item-down': function (e, value, row) {
                  http.post(config.api.sortInfoTypeDown, {
                    data: {
                      oid: row.oid
                    },
                    contentType: 'form',
                  }, function (result) {
                    $('#informationTypeTable').bootstrapTable('refresh')
                  })
              },
              'click .item-delete': function (e, value, row) {
              	if(row.status==1){
              		toastr.error("正在使用中，不能删除!", '错误信息', {
									  timeOut: 3000
									})
              		return false;
              	}
              	var ishas=0;
              	//判断相应类型下是否含有资讯信息
              	http.post(config.api.isHasInfo, {
                    data: {
                        name: row.name
                    },
                    async:false,
                    contentType: 'form',
                  }, function (result) {
                  	ishas=result;
                  }
                )
              	if(ishas>0){
                  toastr.error("此类型包含有资讯信息，不能删除!", '错误信息', {
									  timeOut: 3000
									})
              		return ;
                }
                $$.confirm({
                  container: $('#deleteConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.delInformationType, {
                      data: {
                        oid: row.oid
                      },
                      async:false,
                      contentType: 'form',
                    }, function (result) {
                      $('#informationTypeTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
            }
          }
        ]
      }
      
      var tableConfig1 = {
        ajax: function (origin) {
          http.post(config.api.imagesList, {
            data: {                
            	page: pageOptions1.number,
              rows: pageOptions1.size,
              imgName: pageOptions1.imgName,
              reqTimeBegin: pageOptions1.reqTimeBegin,
              reqTimeEnd: pageOptions1.reqTimeEnd
            },
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        pagination: true,
        sidePagination: 'server',
        queryParams: getQueryParams1,
        columns: [
          {
            width: 30,
            align: 'center',
            formatter: function (val, row, index) {            	             	
              return pageOptions1.offset + index + 1
            }
          },
          {
            field: 'imgName',
          },
          {
            field: 'imgUrl',
          },
          {
            field: 'imgUrl',
            align: 'center',
            formatter: function (val) {
              return '<img width="60" height="50" align="left" src="' + val + '"/>'
            }
          },          
          {
            field: 'createTime',
            formatter: function (val, row, index) {            
              return null == val ? '--' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
            }
          },
          {
          	align: 'center',          	
            formatter: function (val, row, index) {
            	var buttons = [
		            	{
		            		text: '删除',
		            		type: 'button',
		            		class: 'item-delete',
		            		isRender: true
		            	}
              ]
            	return util.table.formatter.generateButton(buttons, 'imagesTable');
            },
            events: {
              'click .item-delete': function (e, value, row) {
              	$('#deleteConfirm').find('p').html("确定删除此图片?")
                $$.confirm({
                  container: $('#deleteConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.imagesDel, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#imagesTable').bootstrapTable('refresh')
                    })
                  }
                })
              }        
            }
          }
        ]
      }

      $('#informationTable').bootstrapTable(tableConfig)
      $('#informationTypeTable').bootstrapTable(tableConfig2)
      $('#imagesTable').bootstrapTable(tableConfig1)

      $$.searchInit($('#searchForm'), $('#informationTable'))
      $$.searchInit($('#search1Form'), $('#imagesTable'))
      
      util.form.validator.init($('#create1Form'))
      util.form.validator.init($('#create2Form'))
      util.form.validator.init($('#picForm1'))
      util.form.validator.init($('#picForm2'))
      util.form.validator.init($('#informationTypeForm'))
      util.form.validator.init($('#approveForm'))
      util.form.validator.init($('#createForm'))
      util.form.validator.init($('#picForm'))
      
      $('#createImages').on('click', function () {
      	var form = document.createForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				
				var picForm = document.picForm
				$(picForm).validator('destroy')
				util.form.validator.init($(picForm));
      	
       //去除重复提交样式
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
        $('#picForm').clearForm()
        $('#createForm')
        .clearForm()
        .find('input[type=hidden]').val('')
        $('#create1Modal').show()
      })
      
      //上传图片
      $('#createSubmit').on('click', function () {
      	if (!$('#createForm').validator('doSubmitCheck')) return
      	if (!$('#picForm').validator('doSubmitCheck')) return
      	if(document.createForm.imgName.value.length>60){
      		toastr.error('图片名称长度不能超过60（包含）！', '错误信息', {
				    timeOut: 3000
				  })
      		return
      	}  
				//添加防止重复提交样式
  		  $('#refreshDiv').addClass('overlay');
					$('#refreshI').addClass('fa fa-refresh fa-spin');
          $('#picForm').ajaxSubmit({
            url: config.api.yup,
            success: function (picResult) {
              document.createForm.imgUrl.value = location.protocol + '//' + location.host + '/' + picResult[0].url
              imageFormSubmit()
            }
          })
      })
      
      function imageFormSubmit () {
        $('#createForm').ajaxSubmit({
          url: config.api.imagesAdd,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#create1Modal').hide()
               $('#imagesTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          		//去除重复提交样式
							$('#refreshDiv').removeClass('overlay');
							$('#refreshI').removeClass('fa fa-refresh fa-spin');
          	}          	            
          }
        })
      }

      /**
       * 新建资讯信息
       */
      $("#createInformation").on("click",function(){
      	var create1Form = document.create1Form
				$(create1Form).validator('destroy')
				util.form.validator.init($(create1Form));
				
				var create2Form = document.create2Form
				$(create2Form).validator('destroy')
				util.form.validator.init($(create2Form));
				
				var picForm1 = document.picForm1
				$(picForm1).validator('destroy')
				util.form.validator.init($(picForm1));
				
				var picForm2 = document.picForm2
				$(picForm2).validator('destroy')
				util.form.validator.init($(picForm2));
      	
      	$('#refreshDiv1').removeClass('overlay');
				$('#refreshI1').removeClass('fa fa-refresh fa-spin');
				$('#refreshDiv2').removeClass('overlay');
				$('#refreshI2').removeClass('fa fa-refresh fa-spin');
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
      	$(".presentation").removeClass("active")
      	$(".tab-pane").removeClass("active");
      	$("#li1").addClass("active")
      	$("#tabcon1").addClass("active")
      	_this.operating.operateType = 'add'
				 $('#picForm1').clearForm()
				 $('#picForm2').clearForm()
        $('#create1Form')
        .clearForm()
        .find('input[type=hidden]').val('')
        $('#create2Form')
        .clearForm()
        .find('input[type=hidden]').val('')
        CKEDITOR.instances.editoraction1.setData('<p></p>');
        $('#createModal')
        .modal('show')
				.find('.modal-title').html("新建资讯");
      })

      $('#sortInformation').on('click', function () {
      	var informationTypeForm = document.informationTypeForm
				$(informationTypeForm).validator('destroy')
				util.form.validator.init($(informationTypeForm));
      	$('#informationTypeForm').clearForm();
        $('#sortModal').modal('show')
      })

      $('#create1Submit').on('click', function () {
 				if (!$('#create1Form').validator('doSubmitCheck')) return
 				
		  	var urlActivity=document.create1Form.url.value;
			      	if(urlActivity){
				        var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
											var objExp=new RegExp(Expression);
											if(!objExp.test(urlActivity)){
											    toastr.error("请输入合法的链接地址(如：http(s)://www.baidu.com)", '错误信息', {
													  timeOut: 3000
													})
											    return false;
								}
			      		
			  }
      	if ( document.picForm1.humbnailPic.value!='') {
				
      		//缩略图片
      		var filename2=document.picForm1.humbnailPic.value;
      		//文件后缀名截取
      		var postf2=util.getSuffixName(filename2);
      		if(postf2.toLowerCase()==".jpg"||postf2.toLowerCase()==".png"){
      		}else{
      			toastr.error("缩略图片格式仅限JPG、PNG", '错误信息', {
						  timeOut: 3000
						})
      		  return false;
      		}
      		//添加防止重复提交样式
  		    $('#refreshDiv1').addClass('overlay');
					$('#refreshI1').addClass('fa fa-refresh fa-spin');	
          $('#picForm1').ajaxSubmit({
            url: config.api.yup,
            success: function (picResult) {
              document.create1Form.thumbnailUrl.value = '/' + picResult[0].url;
              informationFormSubmit1()
            }
          })

        }else{
        	if(_this.operating.operateType === 'update'){
        		 informationFormSubmit1()
        	}else{
//      		toastr.error("请选择需要上传的图片", '错误信息', {
//						  timeOut: 3000
//						})
              informationFormSubmit1()
        	}
        }

      })

      function informationFormSubmit1 () {
      	//添加防止重复提交样式
	      $('#refreshDiv1').addClass('overlay');
				$('#refreshI1').addClass('fa fa-refresh fa-spin');
        var url = '';
        if(document.create1Form.oid.value){
					url = config.api.informationEdit;
				}else{
					url = config.api.informationAdd;
				}
        $('#create1Form').ajaxSubmit({
          url: url,
          success: function (addResult) {
            if(addResult.errorCode==0){
            	$('#createModal').modal('hide')
              $('#informationTable').bootstrapTable('refresh')
            }else{
            	errorHandle(addResult);
            	//去除重复提交样式
							$('#refreshDiv1').removeClass('overlay');
							$('#refreshI1').removeClass('fa fa-refresh fa-spin');
            }
          }
        })
      }
      
      $('#create2Submit').on('click', function () {
				if (!$('#create2Form').validator('doSubmitCheck')) return
      	if ( document.picForm2.humbnailPic.value!='') {
					
      		//缩略图片
      		var filename2=document.picForm2.humbnailPic.value;
      		//文件后缀名截取
      		var postf2=util.getSuffixName(filename2);
      		if(postf2.toLowerCase()==".jpg"||postf2.toLowerCase()==".png"){
      		}else{
      			toastr.error("缩略图片格式仅限JPG、PNG", '错误信息', {
						  timeOut: 3000
						})
      		  return false;
      		}
      		//添加防止重复提交样式
  		    $('#refreshDiv2').addClass('overlay');
					$('#refreshI2').addClass('fa fa-refresh fa-spin');
          $('#picForm2').ajaxSubmit({
            url: config.api.yup,
            success: function (picResult) {
              document.create2Form.thumbnailUrl.value = '/' + picResult[0].url;
              informationFormSubmit2()
            }
          })

        }else{
        	if(_this.operating.operateType === 'update'){
        		 informationFormSubmit2()
        	}else{
//      		toastr.error("请选择需要上传的图片", '错误信息', {
//						  timeOut: 3000
//						})
        		 informationFormSubmit2()
        	}
        }

      })

      function informationFormSubmit2 () {
      	//添加防止重复提交样式
  		  $('#refreshDiv2').addClass('overlay');
				$('#refreshI2').addClass('fa fa-refresh fa-spin');
        var url = '';
        document.create2Form.url.value = "";
        document.create2Form.content.value = CKEDITOR.instances.editoraction1.getData();
        if(document.create2Form.oid.value){
					url = config.api.informationEdit;
				}else{
					url = config.api.informationAdd;
				}
        $('#create2Form').ajaxSubmit({
          url: url,
          success: function (addResult) {
          	if(addResult.errorCode==0){
              $('#createModal').modal('hide')
              $('#informationTable').bootstrapTable('refresh')
            }else{
            	errorHandle(addResult);
            	//去除重复提交样式
							$('#refreshDiv2').removeClass('overlay');
							$('#refreshI2').removeClass('fa fa-refresh fa-spin');
            }
          }
        })
      }

       /**
       * 点击取消按钮关添加类型页面
       */
      $('#sortSubmit').on('click', function () {
        $('#sortModal').modal('hide')
      })

 			//新增图片modal框隐藏
       $('.addIamgeModalClose').on('click', function(){
      		$('#create1Modal').hide()
      })

      function getQueryParams (val) {
      	 // 分页数据赋值
        pageOptions.size = val.limit
        pageOptions.number = parseInt(val.offset / val.limit) + 1
        pageOptions.offset = val.offset
        var form = document.searchForm
        pageOptions.channelOid = form.channelOid.value
        pageOptions.title = form.title.value.trim()
        pageOptions.status = form.status.value,
        pageOptions.type = form.type.value
        return val
      }
      
      function getQueryParams1 (val) {
        var form = document.search1Form
         // 分页数据赋值
        pageOptions1.size = val.limit
        pageOptions1.number = parseInt(val.offset / val.limit) + 1
        pageOptions1.offset = val.offset
        pageOptions1.imgName = form.imgName.value.trim()
        pageOptions1.reqTimeBegin = form.reqTimeBegin.value
        pageOptions1.reqTimeEnd = form.reqTimeEnd.value
        return val
      }

    },
	  bindEvent:function(){
			var _this = this;
			// var editor = CKEDITOR.replace('editoraction')
			// CKEDITOR.instances.content.insertHtml

			//审批操作通过按钮
			$("#approveBut").on('click',function(){
					if (!$('#approveForm').validator('doSubmitCheck')) return
				  document.approveForm.apprResult.value ='pass';
				  
				  $('#approveForm').ajaxSubmit({
              url: config.api.informationReview,
              success: function (res) {
		          	if(res.errorCode==0){
		          		 $('#approvetModal').modal('hide')
		            	 $('#informationTable').bootstrapTable('refresh')
		          	}else{
		          		errorHandle(res);
		          	}
              }
          })
			})

			//审批操作驳回按钮
			$("#approveRefuseBut").on('click',function(){
					if (!$('#approveForm').validator('doSubmitCheck')) return
				  document.approveForm.apprResult.value ='refused';
				  
				  $('#approveForm').ajaxSubmit({
              url: config.api.informationReview,
              success: function (res) {
		          	if(res.errorCode==0){
		          		 $('#approvetModal').modal('hide')
		            	 $('#informationTable').bootstrapTable('refresh')
		          	}else{
		          		errorHandle(res);
		          	}
             }
         })
			})
			//添加资讯类型
			$("#addInformationTypeSubmit").on('click',function(){
				if (!$('#informationTypeForm').validator('doSubmitCheck')) return
				
				var informaitnTypeValue=$("#infoTypeName").val();
				var isHasSame="0"
				http.post(config.api.infoTypeNameIsSame, {
	            data: {
	            	name:informaitnTypeValue,
	            },
	            async:false,
	             contentType: 'form',
	          }, function (result) {
	              isHasSame=result;
	          }
	      )
				if(isHasSame>0){
					toastr.error("已有相同的资讯类型", '错误信息', {
					  timeOut: 3000
					})
					return false;
				}
				 $('#informationTypeForm').ajaxSubmit({
              url: config.api.addInformationType,
               async:false,
              success: function (res) {
		          	if(res.errorCode==0){
		          		$('#informationTypeForm').clearForm();
		          		$('#informationTypeForm').validator('validate')
		          		$('#informationTypeTable').bootstrapTable('refresh')		          		
		          	}else{
		          		errorHandle(res);
		          	}
             }
         })
			})
		}
  }
})
