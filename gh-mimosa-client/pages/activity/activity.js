define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'activity',
    init: function (){
	  	var _this = this;
	  	_this.pagesInit();
	  	_this.bindEvent();
	  },
	  activityInfo:{
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
        channelOid:'',
        title:'',
        status:'',
        publishTimeBegin:'',
        publishTimeEnd:''
      }

		  var confirm = $('#confirmModal');
		  // 数据表格配置
		  var tableConfig = {
				ajax: function (origin) {
          http.post(config.api.activityQuery, {
            data: {
              page: pageOptions.number,
              rows: pageOptions.size,
              channelOid: pageOptions.channelOid,
              title: pageOptions.title,
              status: pageOptions.status,
              publishTimeBegin:pageOptions.publishTimeBegin,
              publishTimeEnd:pageOptions.publishTimeEnd
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
		        case 'picUrl':
		        	viewImage(value,row)
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
            class:'table_title_detail'
          },
          {
            field: 'location',
            formatter: function (val) {
            	return util.enum.transform('locationTypes', val);
            }
          },
          {
            field: 'linkUrl',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'picUrl',
            align: 'center',
            formatter: function (val) {
              return util.table.formatter.thumbImg(val)
            }
          },
          {
            field: 'status',
            formatter: function (val) {
            	return util.enum.transform('activityStatus', val);
            }
          },
          {
            field: 'publishTime',
            align: 'right',
            formatter: function (val, row, index) {
              return (undefined == val ||val==null)? '-': util.table.formatter.timestampToDate(val, 'YYYY-MM-DD')
            }
          },
          {
            field: 'beginTime',
            align: 'right',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'endTime',
            align: 'right',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
          	align: 'center',
            formatter: function (val, row, index) {
            	var isOffShow=false;
            	var isOnShow=false;
            	if(row.status=='on'){
            		isOffShow=true;
            	}else if(row.status=='off'||row.status=='reviewed'){
            		isOnShow=true;
            	}
            	var buttons = [{
		            		text: '审核',
		            		type: 'button',
		            		class: 'item-review',
		            		isRender: row.status=='pending'
		            	},{
		            		text: '上架',
		            		type: 'button',
		            		class: 'item-on',
		            		isRender: isOnShow
		            	},
		            	{
		            		 text: '下架',
		            		 type: 'button',
		            		 class: 'item-on',
		            		 isRender: isOffShow
		            	}]
								var format = util.table.formatter.generateButton(buttons, 'activityTable')
	            	if(row.status=='pending'||row.status=='reject'||row.status=='off'){
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
              	 $('#picForm').clearForm()
					       $('#createForm1')
					       .clearForm()
					       .find('input[type=hidden]').val('')
					      if(row.linkType==0){
            			  $("#activity_showUrl").show();
      							$("#activity_showtoPage").hide();
            		}else if(row.linkType==1){
            			  $("#activity_showUrl").hide();
      							$("#activity_showtoPage").show();
            		}
              	_this.operating.operateType = 'update';
                _this.operating.row = row;
							  $$.formAutoFix($('#createForm1'), row); // 自动填充详情
							  // 编辑时展示图片
                showTablePic(true, row.picUrl);
							  
							  var picForm = document.picForm;
								$(picForm.picFile).removeAttr('required');
								$(picForm).validator('destroy')
														  
                $('#createForm1').validator('validate')
                $(picForm).validator('validate')

								$('#createModal').modal('show')
								.find('.modal-title').html("修改活动");
              },
              'click .item-review': function (e, value, row) {
              	var form = document.approveForm
								$(form).validator('destroy')
								util.form.validator.init($(form));
              	
                $('#approveForm').clearForm()
					        .find('input[type=hidden]').val('')
								$('#approvetModal').modal('show');
								document.approveForm.oid.value =row.oid;
              },
              'click .item-delete': function (e, value, row) {
                $$.confirm({
                  container: $('#deleteConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.activitydel, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#activityTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
              'click .item-on': function (e, value, row) {
               $('#isShelf').html($(this).html());
               var ishas=0;
               //当上架时判断是否有相同位置的活动已经上架
               var status=row.status;
               if(status=='reviewed'||status=='off'){
	               http.post(config.api.isHasPublished, {
	                      data: {
	                        location: row.location
	                      },
	                      async:false,
	                      contentType: 'form',
	                    }, function (result) {
	                      ishas=result;
	                })
	               if(ishas>0){
	               	  toastr.error('已有相同位置的活动上架', {
										  timeOut: 3000
										})
	              		return ;
	               }
               }
               $$.confirm({
                  container: $('#publishConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.activityPubilsh, {
                      data: {
                        oid: row.oid
                      },
                      async:false,
                      contentType: 'form',
                    }, function (result) {
                      $('#activityTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
            }
          }
        ]
      }
		  function queryInfo(value,row){
		  	http.post(config.api.activityInfo, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form'
               }, function (result) {
                  $$.detailAutoFix($('#detailForm'), result); // 自动填充详情
                  $("#picUrlDetail").attr('src', result.picUrl);
                  $("#createTimeDetail").text(result.createTime==null?'--':util.table.formatter.timestampToDate(result.createTime, 'YYYY-MM-DD HH:mm:ss'));
                  $("#reviewTimeDetail").text(result.reviewTime==null?'--':util.table.formatter.timestampToDate(result.reviewTime, 'YYYY-MM-DD HH:mm:ss'));
                  $("#reviewRemarkDetail").text(result.reviewRemark);
                  $("#publishTimeDetail").text(result.publishTime==null?'--':util.table.formatter.timestampToDate(result.publishTime, 'YYYY-MM-DD HH:mm:ss'));
                })
								$('#detailModal').modal('show').find('.modal-title').html("活动详情");
		  }
      $('#activityTable').bootstrapTable(tableConfig)

      $$.searchInit($('#searchForm'), $('#activityTable'))
     
      util.form.validator.init($('#createForm1'))
      util.form.validator.init($('#picForm'))
      util.form.validator.init($('#approveForm'))
      
      /**
       * 新建资讯信息
       */
      $("#createActivity").on("click",function(){
      	var form = document.createForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				
				var picForm = document.picForm
				$(picForm.picFile).attr('required', true);
				$(picForm).validator('destroy')
				util.form.validator.init($(picForm));
      	
      		//去除重复提交样式
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				//将URL输入框显示出来
				$("#activity_showUrl").show();
      	$("#activity_showtoPage").hide();
      	_this.operating.operateType = 'add'
				$('#picForm').clearForm()
        $('#createForm1')
        .clearForm()
        .find('input[type=hidden]').val('');
        // 新增时展示图片
        showTablePic(false);
        $('#createModal')
        .modal('show')
				.find('.modal-title').html("新建活动");

			})

      $('#createSubmit').on('click', function () {
      	if (!$('#createForm1').validator('doSubmitCheck')) return      	
      	
      	var linkType = $('input[name="linkType"]:checked').val(); 
        var toPage = $('input[name="toPage"]:checked').val(); 
        if(!linkType){
        	toastr.error('请选择链接类型', '错误信息', {
					  timeOut: 3000
					})
	        return;
        }
        if(linkType==0){
        	$('input[name="toPage"]').removeAttr('checked'); 
        }
        if(linkType==1){
        	if(!toPage){
	        	toastr.error('请选择跳转的页面', '错误信息', {
						  timeOut: 3000
						})
		        return;
	        }
        	$('input[name="linkUrl"]').val('')
        }else{
        	var urlActivity=document.createForm.linkUrl.value;
	      	if(!urlActivity){
        		toastr.error('链接地址不能为空', '错误信息', {
						  timeOut: 3000
						})
        		return;
        	}else{
        		var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
							var objExp=new RegExp(Expression);
							if(!objExp.test(urlActivity)){
							    toastr.error('请输入合法的链接地址(如：http(s)://www.baidu.com)', {
									  timeOut: 3000
									})
							    return false;
							}
        	}
        }
				// 图片校验
				if (!$('#picForm').validator('doSubmitCheck')) return

				if ($(document.picForm.picFile).attr('required') == 'required') {
				  if (!document.picForm.picFile.value) {
				  		toastr.error("请选择需要上传的图片", '错误信息', {
									timeOut: 3000
							})
				  }
				  
				  var filename=document.picForm.picFile.value;
	  			//文件后缀名截取
	  			var postf=util.getSuffixName(filename);
					if(postf.toLowerCase()==".jpg"||postf.toLowerCase()==".png"){
						//添加防止重复提交样式
	      		$('#refreshDiv').addClass('overlay');
					  $('#refreshI').addClass('fa fa-refresh fa-spin');
	          $('#picForm').ajaxSubmit({
	            url: config.api.yup,
	            success: function (picResult) {
	              document.createForm.picUrl.value = '/' + picResult[0].url
	              activityFormSubmit()
	            }
	          })
	
					}else{
						toastr.error('图片格式仅限JPG、PNG,只可上传一张', {
						  timeOut: 3000
						})
	  		  	return false;
					}
				} else {
					 activityFormSubmit();
				}

      })

      function  activityFormSubmit () {
      	$('#refreshDiv').addClass('overlay');
				$('#refreshI').addClass('fa fa-refresh fa-spin');
        var url = '';
        if(_this.activityInfo.oid){
					url = config.api.activityEdit;
					document.createForm.oid.value = _this.activityInfo.oid
				}else{
					url = config.api.activityAdd;
				}
        $('#createForm1').ajaxSubmit({
          url: url,
          success: function (addResult) {
            if(addResult.errorCode==0){
		          		 $('#createModal').modal('hide')
             	_this.activityInfo.oid="";
            		$('#activityTable').bootstrapTable('refresh')
		        }else{
		          		errorHandle(addResult);
		          		//去除重复提交样式
									$('#refreshDiv').removeClass('overlay');
									$('#refreshI').removeClass('fa fa-refresh fa-spin');
		        }
          }
        })
      }

      $('#createReset').on('click', function () {
        var form = document.createForm
        if (_this.operating.operateType === 'update') {
          $$.formAutoFix($('#createForm1'), _this.operating.row)
          
          showTablePic(true, _this.operating.row.picUrl);
          
          var picForm = document.picForm;
          $(picForm.picFile).removeAttr('required');
					$(picForm).validator('destroy')
          picForm.reset();
          
          $(form).validator('validate')
          $(picForm).validator('validate')
          
        } else {
        	document.createForm.reset()
        	document.picForm.reset()
        	$(form).validator('validate')
        }
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
        pageOptions.publishTimeBegin=form.publishTimeBegin.value,
        pageOptions.publishTimeEnd=form.publishTimeEnd.value
        return val
      }
      
      function viewImage(value,row){
      	$('#viewImage').attr('src',value)  
      	$('#viewModal').modal('show')
      }

			// 编辑展示图片
      function showTablePic(isShow, imgUrl) {
      	if (isShow) {
      		  $('#editImageUrl').attr('src', imgUrl);
            $('#activityPicTable').show();
            $('#picDiv').hide();
      	} else {
      		  $('#editImageUrl').attr('src', '');
            $('#activityPicTable').hide();
            $('#picDiv').show();
      	}
      }

    },
	  bindEvent:function(){
			var _this = this;
			
			//点击调整类型将对应的页面显示出来
			$('#activity_toPage').on('click', function(){
        $("#activity_showUrl").hide();
      	$("#activity_showtoPage").show();
      })
			 
      $('#activity_toUrl').on('click', function(){
        $("#activity_showtoPage").hide();
      	$("#activity_showUrl").show();
      })
      
      // 隐藏编辑展示的图片，原上传按钮展示出来
      $('#picDelButton').on('click', function () {
	      	$('#editImageUrl').attr('src', '');
          $('#activityPicTable').hide();
          
          var picForm = document.picForm
          $(picForm.picFile).attr('required', true);
					$(picForm).validator('destroy')
					util.form.validator.init($(picForm));
          
          $('#picDiv').show();
      })
			
			//审批操作通过按钮
			$("#approveBut").on('click',function(){
				  if (!$('#approveForm').validator('doSubmitCheck')) return
				  document.approveForm.apprResult.value ='pass';
				  
				  $('#approveForm').ajaxSubmit({
              url: config.api.activityReview,
              success: function (res) {
		          	if(res.errorCode==0){
		          		 $('#approvetModal').modal('hide')
		          		 _this.activityInfo.oid="";
		            	 $('#activityTable').bootstrapTable('refresh')
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
              url: config.api.activityReview,
              success: function (res) {
		          	if(res.errorCode==0){
		          		 $('#approvetModal').modal('hide')
		          		 _this.activityInfo.oid="";
		            	 $('#activityTable').bootstrapTable('refresh')
		          	}else{
		          		errorHandle(res);
		          	}
             }
         })
			})


		}
  }
})
