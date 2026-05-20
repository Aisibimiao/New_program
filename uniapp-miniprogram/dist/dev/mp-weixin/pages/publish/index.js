"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
if (!Math) {
  LineIcon();
}
const LineIcon = () => "../../components/LineIcon.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const categories = [
      { value: "ELECTRONICS", label: "数码产品" },
      { value: "CLOTHING", label: "服饰鞋包" },
      { value: "BOOK", label: "图书教材" },
      { value: "SPORTS", label: "运动户外" },
      { value: "LIFE", label: "生活用品" },
      { value: "OTHER", label: "其他" }
    ];
    const categoryLabels = categories.map((c) => c.label);
    const collegeOptions = [
      "信息工程学院",
      "计算机学院",
      "电子学院",
      "软件学院",
      "机械学院",
      "电气学院",
      "经管学院",
      "外语学院",
      "其他学院"
    ];
    const majorOptions = [
      "计算机科学与技术",
      "软件工程",
      "电子信息工程",
      "通信工程",
      "机械工程",
      "电气工程",
      "会计学",
      "市场营销",
      "其他专业"
    ];
    const gradeOptions = ["2023", "2024", "2025", "2026"];
    const semesterOptions = ["上", "下"];
    const images = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const form = common_vendor.ref({
      name: "",
      description: "",
      category: "",
      price: "",
      college: "",
      major: "",
      bookName: "",
      grade: "",
      semester: "",
      location: ""
    });
    const selectedCategory = common_vendor.computed(() => {
      const cat = categories.find((c) => c.value === form.value.category);
      return cat ? cat.label : "";
    });
    const canSubmit = common_vendor.computed(() => {
      const baseValid = images.value.length > 0 && form.value.name && form.value.description && form.value.price && form.value.category;
      if (form.value.category === "BOOK") {
        return baseValid && form.value.college && form.value.major && form.value.bookName && form.value.grade;
      }
      return baseValid;
    });
    function goBack() {
      common_vendor.index.navigateBack();
    }
    function onCategoryChange(e) {
      const index = e.detail.value;
      form.value.category = categories[index].value;
      if (form.value.category !== "BOOK") {
        form.value.college = "";
        form.value.major = "";
        form.value.bookName = "";
        form.value.grade = "";
      }
    }
    function onCollegeChange(e) {
      form.value.college = collegeOptions[e.detail.value];
    }
    function onMajorChange(e) {
      form.value.major = majorOptions[e.detail.value];
    }
    function onGradeChange(e) {
      form.value.grade = gradeOptions[e.detail.value];
    }
    function onSemesterChange(e) {
      form.value.semester = semesterOptions[e.detail.value];
    }
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 3 - images.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          images.value = [...images.value, ...res.tempFilePaths];
        }
      });
    }
    function handleImageError(e) {
      console.warn("图片加载失败:", e);
    }
    function removeImage(index) {
      images.value.splice(index, 1);
    }
    async function handleSubmit() {
      if (!canSubmit.value || submitting.value) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        common_vendor.index.showLoading({ title: "发布中..." });
        const uploadedImages = [];
        for (const img of images.value) {
          if (img.startsWith("http")) {
            uploadedImages.push(img);
          } else {
            const url = await api_goods.uploadImage(img);
            if (url) {
              uploadedImages.push(url);
            }
          }
        }
        await api_goods.createGoods({
          name: form.value.name,
          description: form.value.description,
          price: form.value.price,
          images: uploadedImages,
          category: form.value.category,
          college: form.value.college || void 0,
          major: form.value.major || void 0,
          bookName: form.value.bookName || void 0,
          grade: form.value.grade || void 0,
          location: form.value.location || void 0
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "发布成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/goods/my-list" });
        }, 1500);
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "发布失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "arrow-left"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.t(selectedCategory.value || "请选择分类"),
        d: common_vendor.p({
          name: "chevron-right"
        }),
        e: common_vendor.unref(categoryLabels),
        f: common_vendor.o(onCategoryChange),
        g: form.value.category === "BOOK"
      }, form.value.category === "BOOK" ? {
        h: common_vendor.t(form.value.college || "请选择学院"),
        i: common_vendor.p({
          name: "chevron-right"
        }),
        j: collegeOptions,
        k: common_vendor.o(onCollegeChange),
        l: common_vendor.t(form.value.major || "请选择专业"),
        m: common_vendor.p({
          name: "chevron-right"
        }),
        n: majorOptions,
        o: common_vendor.o(onMajorChange),
        p: common_vendor.t(form.value.grade || "请选择年级"),
        q: common_vendor.p({
          name: "chevron-right"
        }),
        r: gradeOptions,
        s: common_vendor.o(onGradeChange),
        t: common_vendor.t(form.value.semester || "请选择学期"),
        v: common_vendor.p({
          name: "chevron-right"
        }),
        w: semesterOptions,
        x: common_vendor.o(onSemesterChange),
        y: form.value.bookName,
        z: common_vendor.o(($event) => form.value.bookName = $event.detail.value)
      } : {}, {
        A: form.value.name,
        B: common_vendor.o(($event) => form.value.name = $event.detail.value),
        C: form.value.description,
        D: common_vendor.o(($event) => form.value.description = $event.detail.value),
        E: common_vendor.t(form.value.description.length),
        F: common_vendor.f(images.value, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(handleImageError, index),
            c: "ce8f53b1-6-" + i0,
            d: common_vendor.o(($event) => removeImage(index), index),
            e: index
          };
        }),
        G: common_vendor.p({
          name: "close"
        }),
        H: images.value.length < 3
      }, images.value.length < 3 ? {
        I: common_vendor.p({
          name: "plus"
        }),
        J: common_vendor.o(chooseImage)
      } : {}, {
        K: form.value.price,
        L: common_vendor.o(($event) => form.value.price = $event.detail.value),
        M: common_vendor.p({
          name: "location"
        }),
        N: form.value.location,
        O: common_vendor.o(($event) => form.value.location = $event.detail.value),
        P: common_vendor.t(submitting.value ? "发布中..." : "发布商品"),
        Q: !canSubmit.value || submitting.value ? 1 : "",
        R: common_vendor.o(handleSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ce8f53b1"]]);
wx.createPage(MiniProgramPage);
