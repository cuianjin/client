define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'notice',
    init: function () {
      CKEDITOR.replace( 'editoraction2' );
      CKEDITOR.replace( 'linkHtml' );
    	
    	var operating = {
        operateType: '',
        row: {}
      }
      
      var pageOptions = {
      	number: 1,
        size: 10,
        offset: 0,
        channelOid:'',
        title: '',
        subscript: '',
        approveStatus: '',
        releaseStatus: '',
        reqTimeBegin:'',
		    reqTimeEnd:''
      }
      
      var pageOptions1 = {    
      	number: 1,
		    size: 10,
		    offset: 0,
        imgName: '',
        reqTimeBegin: '',
        reqTimeEnd: ''
      }
      
      var tableConfig = {
        ajax: function (origin) {
          http.post(config.api.noticeList, {
            data: {    
            	page: pageOptions.number,
            	rows: pageOptions.size,
              title: pageOptions.title,
              channelOid: pageOptions.channelOid,
              subscript: pageOptions.subscript,
              approveStatus: pageOptions.approveStatus,
              releaseStatus: pageOptions.releaseStatus,
              reqTimeBegin: pageOptions.reqTimeBegin,
			        reqTimeEnd: pageOptions.reqTimeEnd
            },
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        pagination: true,
        sidePagination: 'server',
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
            field: 'linkUrl',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'subscript'
          },
          {
            field: 'page',
            formatter: function (val) {
            	return util.enum.transform('pageStatus', val);
            }
          },
          {
            field: 'top',
            formatter: function (val) {
            	return util.enum.transform('topStatus', val);
            }
          }, 
          {
            field: 'sourceFrom',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'approveStatus',
            formatter: function (val) {
            	return util.enum.transform('approveStatus', val);
            }
          },          
          {
            field: 'releaseStatus',
            formatter: function (val) {
            	return util.enum.transform('releaseStatus', val);
            }
          },
          {
            field: 'releaseOpe',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'onShelfTime',
            align: 'right',
            formatter: function (val, row, index) {            
              return (undefined == val || null == val) ? '-' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD');
            }
          },
          {
          	align: 'center',          	
            formatter: function (val, row, index) {
            	var editStatus = true;
            	//新增时候发布状态是null
            	if(row.approveStatus=='pass' && !row.releaseStatus){
            		editStatus = false; 
            	}
            	if(row.approveStatus=='pass' && row.releaseStatus=='ok'){
            		editStatus = false; 
            	}
            	var buttons = [{
										text: '操作',
										type: 'buttonGroup',
//										isCloseBottom: index >= $('#noticeTable').bootstrapTable('getData').length - 1,
										sub:[{
			            		text: '审核',
			            		type: 'button',
			            		class: 'item-approve',
			            		isRender: row.approveStatus=='toApprove'
			            	},{
			            		text: '首页推荐',
			            		type: 'button',
			            		class: 'item-page',
			            		isRender: row.page=='no' && row.releaseStatus=='ok'
			            	},{
			            		text: '撤出首页',
			            		type: 'button',
			            		class: 'item-outPage',
			            		isRender: row.page=='is' && row.releaseStatus=='ok'
			            	},{
			            		text: '置顶',
			            		type: 'button',
			            		class: 'item-top',
			            		isRender: row.top=='2' && row.releaseStatus=='ok'
			            	},{
			            		text: '撤出置顶',
			            		type: 'button',
			            		class: 'item-outTop',
			            		isRender: row.top=='1' && row.releaseStatus=='ok'
			            	},{
			            		text: '上架',
			            		type: 'button',
			            		class: 'item-onShelf',
			            		isRender: row.approveStatus=='pass'&&(row.releaseStatus=='no'||row.releaseStatus=='wait')
			            	},{
			            		text: '下架',
			            		type: 'button',
			            		class: 'item-offShelf',
			            		isRender: row.approveStatus=='pass'&&row.releaseStatus=='ok'
			            	}]
							}]
            	var format = util.table.formatter.generateButton(buttons, 'noticeTable');
            	if(editStatus){
            		format += '<span class="text-align:right;" style="float:right;"><span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
            		
            	}
            	if(row.releaseStatus!='ok'){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;width:35px;" class="fa fa-trash-o item-delete"></span></span>';
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
                operating.operateType = 'update'
                operating.row = row
                $(".presentation").removeClass("active")
                $(".tab-pane").removeClass("active");
                $$.formAutoFix($('#create1Form'), row)
                $$.formAutoFix($('#create2Form'), row)
                CKEDITOR.instances.editoraction2.setData(row.linkHtml || '<p></p>');
	            	if(row.linkUrl){
	            		$("#li1").addClass("active")
	            		$("#tabcon1").addClass("active")
	            	}else{
	            		$("#li2").addClass("active")
	            		$("#tabcon2").addClass("active")
	            	}
                $('#createModal')
                .modal('show')
                .find('.modal-title').html('修改公告')               
                $(document.create1Form).validator('validate')
                $(document.create2Form).validator('validate')
              },
              'click .item-delete': function (e, value, row) {
              	dealNotice(this, '确定删除此条数据?', config.api.noticeDelete, {oid:row.oid})              	               
              },
              'click .item-approve': function (e, value, row) {    
              	
              	var form = document.approveForm
								$(form).validator('destroy')
								util.form.validator.init($(form));				    				       
              	
              	document.approveForm.oid.value = row.oid;
                $('#noticeTitle').html(row.title);
                util.form.reset($('#approveForm'));
                $('#approvetModal').modal('show');
              },             
              'click .item-page': function (e, value, row) {
              	dealNotice(this, '确定首页推荐此条数据?', config.api.noticePage, {oid:row.oid, page:'is'})
              },
              'click .item-outPage': function (e, value, row) {
              	dealNotice(this, '确定撤出首页?', config.api.noticePage, {oid:row.oid, page:'no'}) 
              },
              'click .item-top': function (e, value, row) {
              	dealNotice(this, '确定置顶此条数据?', config.api.noticeTop, {oid:row.oid, top:'1'})
              },
              'click .item-outTop': function (e, value, row) {
              	dealNotice(this, '确定撤出置顶?', config.api.noticeTop, {oid:row.oid, top:'2'}) 
              },
              'click .item-onShelf': function (e, value, row) {
              		//添加表单验证初始化
								var form1 = document.onShelfForm
								$(form1).validator('destroy')
								util.form.validator.init($(form1));
								
              	form1.oid.value = row.oid;
              	$('#onShelfModal').modal('show');
              },
              'click .item-offShelf': function (e, value, row) {
              	dealNotice(this, '确定下架此条数据?', config.api.noticeOnshelf, {oid:row.oid, releaseStatus:'no'})
              }
            }
          }
        ]
      }
      function queryInfo(value,row){
      	$$.detailAutoFix($('#detailForm'), row); // 自动填充详情            	
            		$('#updateTime').html(null == row.updateTime ? '--' : util.table.formatter.timestampToDate(row.updateTime, 'YYYY-MM-DD HH:mm:ss'))
       					$('#approveTime').html(null == row.approveTime ? '--' : util.table.formatter.timestampToDate(row.approveTime, 'YYYY-MM-DD HH:mm:ss'))
       					$('#onShelfTime').html(null == row.onShelfTime ? '--' : util.table.formatter.timestampToDate(row.onShelfTime, 'YYYY-MM-DD'))
								$('#releaseTime').html(null == row.releaseTime ? '--' : util.table.formatter.timestampToDate(row.releaseTime, 'YYYY-MM-DD HH:mm:ss'))
								$('#detailRemark').val(row.remark);
								CKEDITOR.instances.linkHtml.setData(row.linkHtml || '<p></p>');
                $('#detailModal').modal('show')
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
              	$('#confirmDiv').find('p').html("确定删除此图片?")
                $$.confirm({
                  container: $('#confirmDiv'),
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

      $('#noticeTable').bootstrapTable(tableConfig)
      $('#imagesTable').bootstrapTable(tableConfig1)
      
      $$.searchInit($('#searchForm'), $('#noticeTable'))
      $$.searchInit($('#search1Form'), $('#imagesTable'))
      
      
      util.form.validator.init($('#create1Form'))
      util.form.validator.init($('#create2Form'))
      util.form.validator.init($('#onShelfForm'))
      util.form.validator.init($('#createForm'))
      util.form.validator.init($('#picForm'))
      util.form.validator.init($('#approveForm'))      
      
      $('#createImages').on('click', function () {
      	var form = document.createForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
      	
       //去除重复提交样式
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
        $('#picForm').clearForm()
        $('#createForm')
        .clearForm()
        .find('input[type=hidden]').val('')
        util.form.reset($('#createForm'));
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
      	//添加重复提交样式
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
      
      $('#createNotice').on('click', function () {
      		//添加表单验证初始化
				var form1 = document.create1Form
				$(form1).validator('destroy')
				util.form.validator.init($(form1));
				
      	var form2 = document.create2Form
				$(form2).validator('destroy')
				util.form.validator.init($(form2));
      	
      	//去除重复提交样式
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
        operating.operateType = 'add'      
        $('#create1Form')
        .clearForm()
        .find('input[type=hidden]').val('')
        $('#create2Form')
        .clearForm()
        .find('input[type=hidden]').val('')
        CKEDITOR.instances.editoraction2.setData('<p></p>');
        
        util.form.reset($('#create1Form'))
				util.form.reset($('#create2Form'))
        
        $('#createModal')
        .modal('show')
        .find('.modal-title').html('新建公告')
      })
      
      //新增
      $('#create1Submit').on('click', function () {
      	if (!$('#create1Form').validator('doSubmitCheck')) return
      	 var urlActivity=document.create1Form.linkUrl.value;
			      	if(urlActivity){
				        var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
											var objExp=new RegExp(Expression);
											if(!objExp.test(urlActivity)){
											    toastr.error('请输入合法的链接地址(如：http(s)://www.baidu.com)', {
												    timeOut: 3000
												  })
											    return false;
								}
			      		
			  }
      	//添加重复提交样式
				$('#refreshDiv1').addClass('overlay');
		    $('#refreshI1').addClass('fa fa-refresh fa-spin');
		    
		   
      	var url = ''
      
        if (operating.operateType === 'update') {
          url = config.api.noticeUpdate
        } else {
          url = config.api.noticeAdd
        }
        document.create1Form.linkHtml.value = "";
        $('#create1Form').ajaxSubmit({
          url: url,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#createModal').modal('hide')
               $('#noticeTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          		//去除重复提交样式
							$('#refreshDiv1').removeClass('overlay');
							$('#refreshI1').removeClass('fa fa-refresh fa-spin');
          	}
          }
        })
      })     
      
      $('#create2Submit').on('click', function () {
      	if (!$('#create2Form').validator('doSubmitCheck')) return
      	
      	//添加重复提交样式
				$('#refreshDiv2').addClass('overlay');
		    $('#refreshI2').addClass('fa fa-refresh fa-spin');
      	var url = ''
        document.create2Form.linkUrl.value = "";
        document.create2Form.sourceFrom.value = "";
        document.create2Form.linkHtml.value = CKEDITOR.instances.editoraction2.getData();
        if (operating.operateType === 'update') {
          url = config.api.noticeUpdate
        } else {
          url = config.api.noticeAdd
        }
        $('#create2Form').ajaxSubmit({
          url: url,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#createModal').modal('hide')
               $('#noticeTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          	  //去除重复提交样式
							$('#refreshDiv2').removeClass('overlay');
							$('#refreshI2').removeClass('fa fa-refresh fa-spin');
          	}
          }
        })
      })
      
      //重置
//    $('#createReset').on('click', function () {
//      var form = document.createForm
//      if (operating.operateType === 'update') {
//        $$.formAutoFix($('#createForm'), operating.row)    
//        $(form).validator('validate')
//      } else {
//      	document.createForm.reset()       
//      	CKEDITOR.instances.editoraction2.setData('<p></p>');
//      	$(form).validator('validate')
//      }
//    })
      
       //审核意见
      function submitRemark(){
      	$('#approveForm').ajaxSubmit({
          url: config.api.noticeDealApprove,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#approvetModal').modal('hide')
               $('#noticeTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          	}          	            
          }
        })
      }
      
      //上架处理
      $('#onShelfBut').on('click', function(){     
      	if (!$('#onShelfForm').validator('doSubmitCheck')) return
      	
      	$('#onShelfForm').ajaxSubmit({
          url: config.api.noticeOnshelf,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#onShelfModal').modal('hide')
               $('#noticeTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          	}          	            
          }
        })
      })
      
      $('#refusedBut').on('click', function(){
      	if (!$('#approveForm').validator('doSubmitCheck')) return
      	document.approveForm.approveStatus.value = 'refused';
      	submitRemark();
      })
      
      $('#passBut').on('click', function(){
      	if (!$('#approveForm').validator('doSubmitCheck')) return
      	document.approveForm.approveStatus.value = 'pass';
      	submitRemark();
      })
      
      //新增图片modal框隐藏
       $('.addIamgeModalClose').on('click', function(){
      		$('#create1Modal').hide()
      })
      
      /**
       * 公告相关处理
       */
      function dealNotice (_this, tip, url, paramData){      	
      	$('#confirmDiv').find('p').html(tip)
        $$.confirm({
          container: $('#confirmDiv'),
          trigger: _this,
          accept: function () {
            http.post(url, {
              data: paramData,
              contentType: 'form',
            }, function (result) {
              $('#noticeTable').bootstrapTable('refresh')
            })
          }
        })        
      }
     
      function getQueryParams (val) {
        var form = document.searchForm
         // 分页数据赋值
        pageOptions.size = val.limit
        pageOptions.number = parseInt(val.offset / val.limit) + 1
        pageOptions.offset = val.offset
        pageOptions.channelOid = form.channelOid.value
        pageOptions.title = form.title.value.trim()
        pageOptions.subscript = form.subscript.value.trim()
        pageOptions.approveStatus = form.approveStatus.value
        pageOptions.releaseStatus = form.releaseStatus.value   
        pageOptions.reqTimeBegin = form.reqTimeBegin.value	
			  pageOptions.reqTimeEnd = form.reqTimeEnd.value
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
    }
  }
})
