/**
 * 角色管理
 */
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'smsinfo',
			init: function() {
				
				$("#vcBtn").on('click', function(){
					var phone = $("#phone");
					if (!phone.val()) {
						toastr.error('请输入手机号！', '错误信息', {
						    timeOut: 3000
						})
						return false;
					}
					
					http.post(config.api.sms.getvc, {
			            data: JSON.stringify({
			            	phone: phone.val(),
			            	sysType: $("smsType").val()
			            }),
			            contentType: 'application/json'
			        }, function (result) {
			        	$("#vericode").val(result.veriCode)
			        })
				})
			}
		}
	})