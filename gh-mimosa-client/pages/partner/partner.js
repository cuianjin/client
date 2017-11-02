define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'partner',
    init: function () {
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
        title: '',
        channelOid: '',
        approveStatus: '',
        releaseStatus: ''
      }
      var tableConfig = {
        ajax: function (origin) {
          http.post(config.api.partner.partnerList, {
            data: {                   
            	page: pageOptions.number,
            	rows: pageOptions.size,
              title: pageOptions.title,
              channelOid: pageOptions.channelOid,
              approveStatus: pageOptions.approveStatus,
              releaseStatus: pageOptions.releaseStatus
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
		        case 'imageUrl':
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
            class: 'table_title_detail'
          },
          {
            field: 'linkUrl',
          },
          {
            field: 'imageUrl',
            align: 'center',
            formatter: function (val) {

              return util.table.formatter.thumbImg(val)

            }
          },     
          {
            field: 'isLink',
            formatter: function (val) {
            	return util.enum.transform('commonTypes', val);
            }
          },
          {
            field: 'isNofollow',
            formatter: function (val) {
            	return util.enum.transform('commonTypes', val);
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
            field: 'releaseTime',
            formatter: function (val, row, index) {     
              return null == row.releaseTime ? '-' : util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
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
            		text: '审核',
            		type: 'button',
            		class: 'item-approve',
            		isRender: row.approveStatus=='toApprove'
            	}
            ]
            	var format = util.table.formatter.generateButton(buttons, 'pageTable')
				            	if(editStatus){
				            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update "></span>'
				            	}
				            	if(row.releaseStatus!='ok'){
				            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;width:35px;" class="fa fa-trash-o item-delete"></span>';
				            	}
			            	return format;
            },
            events: {
            	'click .item-detail': function (e, value, row) {
            		console.log(row);
            		
              },
              'click .item-update': function (e, value, row) {
              	//去除重复提交样式
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');											
								
              	 $('#picForm').clearForm()
					       $('#createForm')
					       .clearForm()
					       .find('input[type=hidden]').val('')
                operating.operateType = 'update'
                operating.row = row
                $$.formAutoFix($('#createForm'), row)
                // 编辑时展示图片
                showTablePic(true, row.imageUrl);
                
                var picForm = document.picForm;
								var createForm = document.createForm;
								$(picForm.picFile).removeAttr('required');
								
								$(createForm).validator('destroy')
								$(picForm).validator('destroy')
                
                $(createForm).validator('validate')
								$(picForm).validator('validate')
								
                $('#createModal')
                .modal('show')
                .find('.modal-title').html('修改')
              },
              'click .item-delete': function (e, value, row) {
              	$('#confirmDiv').find('p').html('确定删除此条数据?')
                $$.confirm({
                  container: $('#confirmDiv'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.partner.partnerDelete, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#pageTable').bootstrapTable('refresh')
                    })
                  }
                })
              },             
              'click .item-approve': function (e, value, row) {
              	var form = document.approveForm;
								$(form).validator('destroy')
								util.form.validator.init($(form));
              	$('#approveForm').clearForm();
                form.oid.value = row.oid;
                $('#bannerTitle').html(row.title);
                $('#approvetModal').modal('show');
              }
            }
          }
        ]
      }
      
      // 编辑展示图片
      function showTablePic(isShow, imgUrl) {
      	if (isShow) {
      		  $('#editImageUrl').attr('src', imgUrl);
            $('#partnerPicTable').show();
            $('#picDiv').hide();
      	} else {
      		  $('#editImageUrl').attr('src', '');
            $('#partnerPicTable').hide();
            $('#picDiv').show();
      	}
      }
      
      function queryInfo(value,row){
      	$$.detailAutoFix($('#detailForm'), row); // 自动填充详情
            		$('#detailImageUrl').attr('src', row.imageUrl);
            		$('#updateTime').html(null == row.updateTime ? '--' : util.table.formatter.timestampToDate(row.updateTime, 'YYYY-MM-DD HH:mm:ss'))
       					$('#approveTime').html(null == row.approveTime ? '--' : util.table.formatter.timestampToDate(row.approveTime, 'YYYY-MM-DD HH:mm:ss'))
								$('#releaseTime').html(null == row.releaseTime ? '--' : util.table.formatter.timestampToDate(row.releaseTime, 'YYYY-MM-DD HH:mm:ss'))
								$('#detailRemark').val(row.remark);
                $('#detailModal').modal('show')
      }
      
      function sortConfig () {   
      	onTable = []
      	offTable = []
      	$("#sortTable").empty()
      	http.post(config.api.partner.partnerSortList, {
          data: {
          	channelOid: document.sortSearchForm.channelOid.value,
          	approveStatus: 'pass'
          },
          contentType: 'form',
          async: false
       }, function (result) {  
       	console.log(result);
       	  for (var i = 0; i < result.total; i++) {
        		result.rows[i].releaseStatus == 'ok' ? onTable.push(result.rows[i]) : offTable.push(result.rows[i])
        	}
        	$$.switcher({
      	    container: $('#sortTable'),
      	    fromTitle: '下架',
      	    toTitle: '上架',
      	    fromArray: offTable,
      	    toArray: onTable,
      	    field: "title",
      	    sort: true
          })
        })
      }

      $('#pageTable').bootstrapTable(tableConfig)
      
      $$.searchInit($('#searchForm'), $('#pageTable'))
      
      util.form.validator.init($('#createForm'))
      util.form.validator.init($('#picForm'))
      util.form.validator.init($('#approveForm'))
            
      $('#createPartner').on('click', function () {
      	//添加表单验证初始化
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
        operating.operateType = 'add';
        $('#createForm').clearForm().find('input[type=hidden]').val('')
        $('#picForm').clearForm()
        
        util.form.reset($('#createForm'))
				util.form.reset($('#picForm'))
				// 新增时展示图片
				showTablePic(false);
        $('#createModal')
        .modal('show')
        .find('.modal-title').html('新建')
      })
      
      $('#sortPartner').on('click', function () {
	      	sortConfig();
      	 	$('#sortModal').modal('show')
      })
      
      $("#sortSelect").on('change', function() {
      		sortConfig();
      })
      
      //新建
      $('#createSubmit').on('click', function () {
      	if (!$('#createForm').validator('doSubmitCheck')) return      	
      	
	    	var url = document.createForm.linkUrl.value;
	    	if(url){
	    		  var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
						var objExp = new RegExp(Expression);
						if(!objExp.test(url)){
							  toastr.error("请输入合法的链接地址(如：http(s)://www.baidu.com)", '错误信息', {
								  timeOut: 3000
								})
							  return false;
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
							  //添加重复提交样式
								$('#refreshDiv').addClass('overlay');
						    $('#refreshI').addClass('fa fa-refresh fa-spin');
			          $('#picForm').ajaxSubmit({
			            url: config.api.yup,
			            success: function (picResult) {
			              document.createForm.imageUrl.value = '/' + picResult[0].url
			              partnerFormSubmit()
			            }
			          })
						}else{
						  toastr.error("图片格式仅限JPG、PNG,只可上传一张", '错误信息', {
							  timeOut: 3000
							})
      		    return false;
						}
       } else {
       	  partnerFormSubmit();
       }
      })

      function partnerFormSubmit () {
      	$('#refreshDiv').addClass('overlay');
				$('#refreshI').addClass('fa fa-refresh fa-spin');
        var url = '';
        if (operating.operateType === 'update') {
          url = config.api.partner.partnerUpdate
        } else {
          url = config.api.partner.partnerAdd
        }
        $('#createForm').ajaxSubmit({
          url: url,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#createModal').modal('hide')
               $('#pageTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          		//去除重复提交样式
							$('#refreshDiv').removeClass('overlay');
							$('#refreshI').removeClass('fa fa-refresh fa-spin');
          	}          	            
          }
        })
      }
            
      // 隐藏编辑展示的图片，原上传按钮展示出来
      $('#picDelButton').on('click', function () {
	      	$('#editImageUrl').attr('src', '');
          $('#partnerPicTable').hide();
          
          var picForm = document.picForm
          $(picForm.picFile).attr('required', true);
					$(picForm).validator('destroy')
					util.form.validator.init($(picForm));
          
          $('#picDiv').show();
      })
      
      
      //审核意见
      function submitRemark(){
      	if (!$('#approveForm').validator('doSubmitCheck')) return
      	
      	$('#approveForm').ajaxSubmit({
          url: config.api.partner.partnerDealApprove,
          success: function (result) {
          	if(result.errorCode==0){
          		 $('#approvetModal').modal('hide')
               $('#pageTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(result);
          	}          	            
          }
        })
      }
      
      $('#refusedBut').on('click', function(){
      	document.approveForm.approveStatus.value = 'refused';
      	submitRemark();
      })
      
      $('#passBut').on('click', function(){
      	document.approveForm.approveStatus.value = 'pass';
      	submitRemark();
      })
      
      $('#sortSubmit').on('click', function () {
      	var length = onTable.length
      	
//    		if(length > 5){
//			    toastr.error('本渠道上最多上架5条,当前选择' + length + '条.', '错误信息', {
//						  timeOut: 3000
//						})
//    			return
//    		}
      	
	  		var x = []
	  		if (length > 0) {
	  			for (var i = 0; i < length; i++) {
	  				x.push(onTable[i].oid)
	  			}
	  		}
	  		http.post(config.api.partner.partnerActive, {
	        data: {
				    	'oids': x.join(','),
				    	channelOid: $("#sortSelect").val()
	        },
	        contentType: 'form',
	      }, function (result) {
	        $('#sortModal').modal('hide')
	        $('#pageTable').bootstrapTable('refresh')
	      })
      	
      	
      })
      
      $('#createReset').on('click', function () {
        var form = document.createForm
        if (operating.operateType === 'update') {
          $$.formAutoFix($('#createForm'), operating.row)
          
          showTablePic(true, operating.row.imageUrl);
          
          var picForm = document.picForm;
          $(picForm.picFile).removeAttr('required');
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
      
      $('#sortReset').on('click', function () {
      	sortConfig()
      })

      function getQueryParams (val) {
        var form = document.searchForm
        pageOptions.size = val.limit
        pageOptions.number = parseInt(val.offset / val.limit) + 1
        pageOptions.offset = val.offset
        pageOptions.channelOid = form.channelOid.value
        pageOptions.title = form.title.value.trim()
        pageOptions.approveStatus = form.approveStatus.value
        pageOptions.releaseStatus = form.releaseStatus.value        
        return val
      }
      
      function viewImage(value,row){
      	$('#viewImage').attr('src',row.imageUrl)  
      	$('#viewModal').modal('show')
      }
    }
  }
})
