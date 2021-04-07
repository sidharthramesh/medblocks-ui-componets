// import Vue from 'vue'
// import axios from 'axios'

Vue.config.ignoredElements = [/mb|sl-\w*/];

var app = new Vue({
    el: "#vueapp",
    data: {
        composition: {},
        systolic: 0,
        loading: false,
        context: {
            "composer_name": "Sidharth Ramesh"
        },
        axios: axios.create({
            baseURL: 'https://cdr.code4health.org/rest/v1/',
            auth: { username: '***REMOVED***', password: '***REMOVED***' }
        }),
        uid: "4b5c6704-c84c-47a9-915b-c6cbd01f06bb::***REMOVED***::4",
        ehr: "25adf3f9-e8e5-474d-a1e3-ca4c89e657e1",
        template: "bloodPressureExample",
    },
    methods: {
        async submit(e) {
            let uuid = await this.$refs["form"].postComposition(e.detail)
            this.uid = uuid
        },
        async load() {
            const data = await this.$refs["form"].getComposition()
            this.composition = data
        }
    },
})