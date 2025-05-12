<template>
  <section class="main-section">
    <el-card class="main-card">
      <h1>簽到退系統</h1>
      <el-form-item label="選擇簽到/簽退" label-position="top">
        <el-select v-model="submitData.actionType" placeholder="請選擇簽到/簽退">
          <el-option label="簽到" :value="1"></el-option>
          <el-option label="簽退" :value="2"></el-option>
        </el-select>
      </el-form-item>


      <el-input v-if="submitData.actionType" v-model="submitData.attendeesId" density="compact" variant="outlined"
        hide-details placeholder="請掃描QR Code 或輸入 Code" class="input-barcode">
        <template #suffix>

        </template>
      </el-input>

      <el-button @click="checkin">test btn</el-button>
      <el-button>
        <el-icon @click="scanBarcode">
          <ElIconCamera />
        </el-icon>
      </el-button>
      <div id="barcode-reader" class="component-barcode-reader"></div>


      <div class="last-member-info-box">
        <el-card v-if="showLastMemberInfo" class="last-member-info">
          <div class="last-member-info-title">會員資訊</div>
          <div class="last-member-info-content">
            <p>姓名: {{ member.attendeesVO.member.chineseName }}</p>
            <p>會員類別: {{ member.attendeesVO.member.category }}</p>
            <p>是否為去年年會參加會員: {{ member.attendeesVO.isLastYearAttendee }}</p>
          </div>
        </el-card>
      </div>
    </el-card>
  </section>
</template>
<script lang="ts" setup>
import { checkinApi } from '@/api/checkin';
import { useHtml5Code } from '@/utils/qrcodeScanner';
import { ElNotification, ElMessage } from 'element-plus';
import { s } from 'vite/dist/node/types.d-aGj9QkWt';

/**-------------------------------------------------- */
const submitData = reactive<any>({
  attendeesId: null,
  location: '',
  actionType: null,
})

const open1 = () => {
  ElNotification({
    title: '提示',
    message: '這是一個提示訊息',
    type: 'info',
    position: 'top-right',
    showClose: true,
    duration: 0,
  })
}

const showLastMemberInfo = ref(false);
const member = reactive<any>({})

const checkin = async () => {
  try {
    console.log('submitData', submitData);
    let res = await checkinApi(submitData);
    Object.assign(member, res.data);
    showLastMemberInfo.value = true;
    console.log('res', res);
    let category = "";
    switch (res.data.attendeesVO.member.category) {
      case 1:
        category = '一般會員';
        break;
    }

    console.log(res.data.attendeesVO.isLastYearAttendee);
    if (res.data.attendeesVO.isLastYearAttendee && submitData.actionType == 1) {

      ElNotification({
        title: `會員: ${res.data.attendeesVO.member.chineseName}`,
        dangerouslyUseHTMLString: true,
        message: `會員類別: ${category}<br/> <p style="color:green;">為去年年會參加會員</p>`,
        duration: 10000,
        type: 'success',
      })
    } else if (!res.data.attendeesVO.isLastYearAttendee) {
      ElNotification({
        title: `會員: ${res.data.attendeesVO.member.chineseName}`,
        dangerouslyUseHTMLString: true,
        message: `會員類別: ${category}<br/><p style="color:red;"> 非去年年會參加會員</p>`,
        duration: 10000,
        type: 'success',
      })

    }
    console.log('res', res);
  } catch (error) {
    console.log(error);
  }
}




/**-------------------------------------------------- */
let html5Qrcode: any;

const checkData = ref('');

onMounted(() => {
  html5Qrcode = useHtml5Code('barcode-reader');
})


const isScannable = ref(true);
const qrCodeSuccessCallback = async (decodedText: any, decodedResult: any) => {

  if (!isScannable.value) return;
  isScannable.value = false;


  ElMessage({
    message: `掃描成功QR Code scanned: ${decodedText}`,
    type: 'success',
  });
  console.log(`QR Code scanned: ${decodedText}`);
  console.log(decodedResult);


  submitData.attendeesId = atob(decodedText);
  ElMessage({
    message: `掃描成功QR Code scanned: ${checkData.value}`,
    type: 'success',
  })

  await checkin();

  setTimeout(() => {
    isScannable.value = true;
  }, 3000);
};

const scanBarcode = () => {
  html5Qrcode.start(qrCodeSuccessCallback)
}

const handleStop = () => {
  html5Qrcode.handleStop()
}

</script>
<style lang="scss" scoped>
.main-section {
  width: 95%;
  margin: 0 auto;
  position: relative;

  .main-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 1% 0;
  }
}

:deep(.el-notification) {
  z-index: 9999;
  position: fixed;
  background-color: black;
  top: 20px;
  right: 20px;
}


:deep(.el-form-item__content) {
  .el-select {
    width: 50%;
  }
}

.component-barcode-reader {
  width: 100%;
  // height: 100vh;

  :deep(#qr-shaded-region) {
    top: 0;
  }

  // margin: 0 auto;
  // display: flex;
  // justify-content: center;
  // align-items: center;
}
</style>