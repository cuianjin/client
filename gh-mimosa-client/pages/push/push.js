define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'push',
    init: function (){
	  	var _this = this;	  	
	  	_this.pagesInit();
	  	_this.bindEvent();
	  },
	  pushInfo:{
	  	oid:''
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
        versionNo:'',
        status:'',
        type:'',
        pushTimeBegin:'',
        pushTimeEnd:''
      }
		  
		  var confirm = $('#confirmModal');
		  // 数据表格配置
		  var tableConfig = {
				ajax: function (origin) {
          http.post(config.api.pushQuery, {
            data: {
              page: pageOptions.number,
              rows: pageOptions.size,
              title: pageOptions.title,
              status: pageOptions.status,
              type:pageOptions.type,
              pushTimeBegin:pageOptions.pushTimeBegin, 
              pushTimeEnd:pageOptions.pushTimeEnd
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
            field: 'summary',
            formatter: function (val) {
            	if (val.length>20){
            		var st = val.substring(0,20)+"......";
            		return st
            	}
            	return val;
            }
          },
          {
            field: 'type',
            formatter: function (val) {
            	return util.enum.transform('pushType', val);
            }
          },
          {
            field: 'pushType',
            formatter: function (val) {
            	return util.enum.transform('pushTypes', val);
            }
          },
          {
            field: 'pushUserAcc',
            class: 'align-right',
            formatter: function (val, row, index) {
              return	(undefined == val ||val==null)?'-':val
            }
          },
          {
            field: 'pushTime',
            class: 'align-right',
            formatter: function (val, row, index) {
              return	(undefined == val ||val==null)?'-':util.table.formatter.timestampToDate(val, 'YYYY-MM-DD ')
            }
          },
          {
            field: 'url',
            formatter: function (val, row, index) {
              return row.type=="activity" ? row.url : '-';
            }
          },
          {
            field: 'status',
            formatter: function (val) {
            	return util.enum.transform('pushStatus', val);
            }
          },
          {
          	align: 'center',
            formatter: function (val, row, index) {
            	var isReview=false;
            	var isPublish=false;
            	if(row.status=='reviewed'){
            		isPublish=true;
            	}else if(row.status=='pending'||row.status=='reject'){
            		isReview=true;
            	}
            	var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#waitTable').bootstrapTable('getData').length - 1,
									sub:[{
		            		text: '审核',
		            		type: 'button',
		            		class: 'item-review',
		            		isRender: row.status=='pending'
		            	},{
		            		text: '发布',
		            		type: 'button',
		            		class: 'item-on',
		            		isRender: isPublish
		            	}]
								}]
            	var format = util.table.formatter.generateButton(buttons, 'pushTable')
            	if(isReview){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
            		
            	}
            	if(row.status!='on'){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
            	}
            	return format;
            },
            events: {
              'click .item-detail': function (e, value, row) {
              	
								
              },
              'click .item-update': function (e, value, row) {
              	//去除重复提交样式
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');
								util.form.reset($('#createForm'));
								
              	_this.operating.operateType = 'update'
              	_this.pushInfo.oid=row.oid;
//								http.post(config.api.pushInfo, {
//                data: {
//                  oid: row.oid
//                },
//                contentType: 'form'
//              }, function (result) {
                	                  
                  $$.formAutoFix($('#createForm'), row); // 自动填充详情      
									if (row.pushType == 'all'){
										$('#pushType').val("all");
										$('#push_user').hide();
										$('#userOids').removeAttr('required');
									}else{
										$('#pushType').val("person");
										$('#push_user').show();
									$('#userOids').attr('required','required');
									}
//									$("#pushType").attr("disabled","disabled");
//									$('#pushType').attr("readonly","readonly");
									
									var form = document.createForm
									$(form).validator('destroy')
									util.form.validator.init($(form));
									
	                var type=row.type;
									if(type=='activity'){
										$("#push_Url").show();
									}else{
										document.createForm.url.value="";
										$("#push_Url").hide();
									}
				
                  $('#createForm').validator('validate')
//              })
								$('#createModal').modal('show')
								.find('.modal-title').html("修改推送"); 
              },
              'click .item-review': function (e, value, row) {
                var approveForm = document.approveForm
								$(approveForm).validator('destroy')
								util.form.validator.init($(approveForm));
                $('#approveForm').clearForm()
					        .find('input[type=hidden]').val('')
								$('#approvetModal').modal('show');
								document.approveForm.oid.value=row.oid
              },
              'click .item-on': function (e, value, row) {              	
               $$.confirm({
                  container: $('#publishConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.pushPubilsh, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#pushTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
              'click .item-delete': function (e, value, row) {
               $$.confirm({
                  container: $('#deleteConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.delPush, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#pushTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
            }
          }
        ]
      }


      $('#pushTable').bootstrapTable(tableConfig)
      
      $$.searchInit($('#searchForm'), $('#pushTable'))
      
      util.form.validator.init($('#createForm'))
      util.form.validator.init($('#approveForm'))
      
//    $('input:radio:first').attr('checked', 'checked');
//    selectUsers();
//			// 缓存全部用户信息
//			function selectUsers(){
//				var users = []
//				http.post(config.api.mail.queryUsers, {
//					data: {
//					},
//					contentType: 'form'
//				}, function(res) {
//					users = res.list
//					var addUsers = $("#userOids");
//					addUsers.html("");
//					users.forEach(function(item) {
//						$(addUsers).append('<option value="' + item.oid + '">' + item.phone + '</option>')
//					})
//					$(addUsers).select2()
//				})
//		}
				
      /**
       * 新建推送信息
       */
      $("#createPush").on("click",function(){
      	util.form.reset($('#createForm'));
      	$('#createForm').clearForm().find('input[type=hidden]').val('')
      	
      	$('#push_user').hide();
      	$('#userOids').removeAttr('required');
      	$("#pushType").removeAttr("disabled");
				$('#pushType').removeAttr("readonly");
      	$('#pushType').val("all");
      	$(document.createForm.pushType).val("all");
      	_this.pushInfo.oid='';
									
      	var form = document.createForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				
      	//去除重复提交样式
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
      	_this.operating.operateType = 'add'
        
        $('#createModal').modal('show').find('.modal-title').html("新建推送");
			  $("#push_Url").hide();
			})
			  
			$('#detailSubmit').on('click', function () {
				  $('#detailModal').modal('hide')
			})
      
      $('#createSubmit').on('click', function () {
      	  if (!$('#createForm').validator('doSubmitCheck')) return
      	
	        var url = '';
	        if(_this.pushInfo.oid){
						url = config.api.pushEdit;
						document.createForm.oid.value = _this.pushInfo.oid
					}else{
						
						url = config.api.pushAdd;					
					}
					var title=document.createForm.title.value;

//						var isHasSame=0;
//		      	http.post(config.api.isHasSamePushTitle, {
//		            data: {
//		            	title:title,
//		            	oid:_this.pushInfo.oid,
//		            },
//		            async:false,
//		             contentType: 'form',
//		          }, function (result) {
//		              isHasSame=result;
//		          }
//		        )
//						if(isHasSame>0){
//							toastr.error("已有相同的标题名称!", '错误信息', {
//							  timeOut: 3000
//							})
//							return false;
//						}
					var activity=	document.createForm.type.value;
					if(activity=='activity'){
						var urlActivity=document.createForm.url.value;
						if(!urlActivity){
							toastr.error("链接地址不能为空!", '错误信息', {
							  timeOut: 3000
							})
							return;
						}else{
							var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
							var objExp=new RegExp(Expression);
							if(!objExp.test(urlActivity)){
							    toastr.error("请输入合法的链接地址(如：http(s)://www.baidu.com)", '错误信息', {
									  timeOut: 3000
									})
							    return false;
							}
							
						}
					}
					
					$(document.createForm.pushType).val($('#pushType').val());
					
					$('#refreshDiv').addClass('overlay');
				  $('#refreshI').addClass('fa fa-refresh fa-spin');
	        $('#createForm').ajaxSubmit({
	          url: url,
	          async:false,
	          success: function (addResult) {
	            if(addResult.errorCode==0){
			          	$('#createModal').modal('hide');
	              	_this.pushInfo.oid='';
	              	$('#pushTable').bootstrapTable('refresh')
			          }else{
			          		errorHandle(addResult);
			          		//去除重复提交样式
										$('#refreshDiv').removeClass('overlay');
										$('#refreshI').removeClass('fa fa-refresh fa-spin');
			          }
	          }
	        })
      })

    
      function getQueryParams (val) {
      	 // 分页数据赋值
        pageOptions.size = val.limit
        pageOptions.number = parseInt(val.offset / val.limit) + 1
        pageOptions.offset = val.offset
        var form = document.searchForm
        pageOptions.title = form.title.value.trim(),
        pageOptions.status = form.status.value,
        pageOptions.type = form.type.value,
        pageOptions.pushTimeBegin=form.pushTimeBegin.value
        if(form.pushTimeEnd.value){
        	var timeEnd = new Date(new Date(form.pushTimeEnd.value).getTime()+86400000)
        	pageOptions.pushTimeEnd = timeEnd.getFullYear() + '-' + (timeEnd.getMonth()+1) + '-' + timeEnd.getDate()
        }else{
        	pageOptions.pushTimeEnd=form.pushTimeEnd.value
        }
        return val
      }
      function queryInfo(value,row){
      	http.post(config.api.pushInfo, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form'
                }, function (result) {
                	 $$.detailAutoFix($('#createFormDetail'), result);
                  var type=result.type;
									if(type=='activity'){
										$("#push_url_detail").show();
									}else{
										$("#push_url_detail").hide();
									}
									if(result.pushType=='person'){
										$("#push_userAcc_detail").show();
									}else{
										$("#push_userAcc_detail").hide();
									}
									$("#summary").text(result.summary);
                  $("#createTimeDetail").text(result.createTime==null?'--':util.table.formatter.timestampToDate(result.createTime, 'YYYY-MM-DD HH:mm:ss'));
                  $("#reviewTimeDetail").text(result.reviewTime==null?'--':util.table.formatter.timestampToDate(result.reviewTime, 'YYYY-MM-DD HH:mm:ss'));
                  $("#reviewRemarkDetail").text(result.reviewRemark);
                  $("#publishTimeDetail").text(result.pushTime==null?'--':util.table.formatter.timestampToDate(result.pushTime, 'YYYY-MM-DD HH:mm:ss'));
                })
								$('#detailModal').modal('show')
      }
   
      
    },   
	  bindEvent:function(){
			var _this = this;
			//审批操作通过按钮
			$("#approveBut").on('click',function(){
				  if (!$('#approveForm').validator('doSubmitCheck')) return
				  document.approveForm.apprResult.value ='pass';
				  $('#approveForm').ajaxSubmit({
              url: config.api.pushReview,
              success: function (res) {
              	_this.pushInfo.oid="";
		          	if(res.errorCode==0){
		          		 $('#approvetModal').modal('hide')
		            	 $('#pushTable').bootstrapTable('refresh')
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
              url: config.api.pushReview,
              success: function (res) {
            	_this.pushInfo.oid="";
		          	if(res.errorCode==0){
		          		 $('#approvetModal').modal('hide')
		            	 $('#pushTable').bootstrapTable('refresh')
		          	}else{
		          		errorHandle(res);
		          	}
             }
         })
			})
			
			// 是否显示选择人		  
			$("#pushType").change(function(){
				var type=$("#pushType").val();
				if(type=='all'){
					$('#push_user').hide();
        	$('#userOids').removeAttr('required');
        	$(document.createForm.pushType).val("all");
				}else{
					$('#push_user').show();
					$('#userOids').attr('required','required');
					$(document.createForm.pushType).val("person");
				}
				var form = document.createForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
			});
			    
			//是否显示url
			changeTypeUrlShow = function(){
				var type=document.createForm.type.value;
				if(type=='activity'){
					$("#push_Url").show();
				}else{
					$("#push_Url").hide();
				}
			}
			
		} 
  }
})
