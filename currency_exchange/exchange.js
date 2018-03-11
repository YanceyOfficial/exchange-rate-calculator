// 引入实时汇率api 和 货币全称api
const api = {
    getCurrencyRatesAPI: 'https://data.fixer.io/api/latest?access_key=4f1ac1861df1befc366eb73b936df507&format=1&base=USD',
    getCountriesAPI: 'http://apilayer.net/api/list?access_key=61b08a0d9a8057599b55b4666e4ada2a'
};

// 命名两个input输入框
const inputNames = {f: 'firstInput', s: 'secondInput'};

// 实时汇率展示：初始化 美刀：欧元
class CurrentExchangeRate extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <h1>1 <span
                className="exchange-country-name">{this.props.firstSelectedCountry}</span> = {this.props.latestRates + ' '}
                <span className="exchange-country-name">{this.props.secondSelectedCountry}</span>
            </h1>
        );
    }
}

// exchange按钮交换两个select，同时会改变 实时汇率展示 模块
class ChangeCountry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {currentFlag: this.props.currentFlag};
        this.buttonClick = this.buttonClick.bind(this);
    }

    buttonClick() {
        const currentFlag = !this.state.currentFlag;
        this.setState({
            currentFlag: currentFlag
        });
        this.props.buttonToggle(currentFlag);
    }

    render() {
        return (
            <button className="button" data-text="Exchange" onClick={this.buttonClick}>Exchange</button>
        )
    }
}

function isNumber(input) {
    if (/^[0-9]+([.][0-9]*)?$/.test(input) === false) {
        return input.slice(0, -1)
    } else {
        return input
    }
}

class MoneyInput extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(ev) {
        this.props.onInputChange(isNumber(ev.target.value));
    }

    render() {
        const inputName = this.props.inputName;
        const inputValue = this.props.inputValue;

        return (
            // 这里用到了ES6的计算属性名
            <input name={inputNames[inputName]} className="input-value" type="text" value={inputValue}
                   placeholder="0" onChange={this.handleChange}/>
        );
    }
}


    // 货币选择：初始化第一个选中的是美刀，第二个选中的欧元
    // 货币选择的变化影响着 汇率展示 和 汇率计算
    class CountryChoice extends React.Component {
        constructor(props) {
            super(props);

            // 初始化状态
            this.state = {
                firstSelectedCountry: 'USD',// 第一个默认被选中的币种是美金
                secondSelectedCountry: 'EUR',// 第二个默认被选中的币种是欧元
                flag: true,// 立一个flag，初始是true，button被点击时在true和false之间切换
                inputName: 'f',// 默认选中的是第一个input标签
                inputValue: ''// 默认input标签的值是空
            };

            this.handleChange = this.handleChange.bind(this);
            this.buttonToggle = this.buttonToggle.bind(this);
            this.firstInputChange = this.firstInputChange.bind(this);
            this.secondInputChange = this.secondInputChange.bind(this);
        }

        // 通过ChangeCountry类传递过来的flag值来设置成当前状态
        buttonToggle(flag) {
            this.setState({flag: flag})
        }

        // 设置select标签的状态

        // 当flag是true时，把firstSelectedCountry的状态设置为name属性为“first-select”的value，
        // 把secondSelectedCountry的状态设置为name属性为“second-select”的value

        // 当flag是true时，把firstSelectedCountry的状态设置为name属性为“first-select”的value，
        // 把secondSelectedCountry的状态设置为name属性为“second-select”的value

        // 也就是说当flag是false时，此时name属性为“first-select”的select标签控制的是name属性为“second-select”的select标签
        // 当然我这里设计的不合理，应该通过动态修改name值才好，放在下一次的项目迭代吧，留个坑先
        handleChange(ev) {
            const target_name = ev.target.name;

            if (this.state.flag) {
                if (target_name === 'first-select') {
                    this.setState({firstSelectedCountry: ev.target.value});
                } else if (target_name === 'second-select') {
                    this.setState({secondSelectedCountry: ev.target.value});
                }

            } else {
                if (target_name === 'first-select') {
                    this.setState({secondSelectedCountry: ev.target.value});
                } else if (target_name === 'second-select') {
                    this.setState({firstSelectedCountry: ev.target.value});
                }
            }
        }

        // 获取第一个input输入的值
        firstInputChange(inputValue) {
            this.setState({inputName: 'f', inputValue});
        }

        // 获取第二个input输入的值
        secondInputChange(inputValue) {
            this.setState({inputName: 's', inputValue});
        }


        render() {

            const inputName = this.state.inputName;
            const inputValue = this.state.inputValue;

            // 因为要用到用户输入的值乘以汇率来进行计算
            // 当用户清空某个input标签的值时，这里就成了NaN
            // 这个函数就是当检测到输入的值为空时，自动设为数字0
            // 啊啊啊，肯定有更好的方法
            function formatInputValue(inputValue) {
                if (inputValue === '') {
                    inputValue = 0;
                    return inputValue
                } else {
                    return parseFloat(inputValue)
                }
            }

            // 这边就写的很笨重了，汇率是根据flag的状态定的
            // 如果是true，汇率是第二个select标签选中的值除以第一个select
            // 假设当前在第一个input输入数值，那么下面的 inputName === 'f' 就是true， 所以第二个input的值（sI）就会被实时计算
            // 反正就是很绕，如果不加exchange按钮要省很多事儿，一切都是为了学习...
            const fI = inputName === 's' ? formatInputValue(inputValue) * (!this.state.flag ? this.props.ratesObj[this.state.secondSelectedCountry] / this.props.ratesObj[this.state.firstSelectedCountry] : this.props.ratesObj[this.state.firstSelectedCountry] / this.props.ratesObj[this.state.secondSelectedCountry]) : inputValue;
            const sI = inputName === 'f' ? formatInputValue(inputValue) * (this.state.flag ? this.props.ratesObj[this.state.secondSelectedCountry] / this.props.ratesObj[this.state.firstSelectedCountry] : this.props.ratesObj[this.state.firstSelectedCountry] / this.props.ratesObj[this.state.secondSelectedCountry]) : inputValue;

            return (
                <div className="container">
                    {/*这边就是把当前状态（两个被选中的货币全称和之间的汇率）传递给①区来显示*/}
                    <CurrentExchangeRate
                        firstSelectedCountry={this.state.flag ? this.props.countriesObj[this.state.firstSelectedCountry] : this.props.countriesObj[this.state.secondSelectedCountry]}
                        secondSelectedCountry={!this.state.flag ? this.props.countriesObj[this.state.firstSelectedCountry] : this.props.countriesObj[this.state.secondSelectedCountry]}
                        latestRates={this.state.flag ? this.props.ratesObj[this.state.secondSelectedCountry] / this.props.ratesObj[this.state.firstSelectedCountry] : this.props.ratesObj[this.state.firstSelectedCountry] / this.props.ratesObj[this.state.secondSelectedCountry]}
                    />

                    {/*当在第二个input输入数字时，换算出来的值会实时显示在第一个input里*/}
                    <div className="item">
                        <MoneyInput
                            inputName='f'
                            inputValue={fI}
                            onInputChange={this.firstInputChange}
                        />

                        {/*传统设置默认选项是在option标签设置selected=selected, 现在放在select标签里，当然还有个Select的三方库*/}
                        {/*通过map将option标签循环添加到第一个select标签里面*/}
                        <select className="select" name="first-select"
                                value={this.state.flag ? this.state.firstSelectedCountry : this.state.secondSelectedCountry}
                                onChange={this.handleChange}>
                            {
                                Object.keys(this.props.ratesObj).map((key) => (
                                    <option key={key.toString()}
                                            value={key}>{key} - {this.props.countriesObj[key]}</option>))
                            }
                        </select>
                    </div>
                    <div className="item">
                        // 当在第一个input输入数字时，换算出来的值会实时显示在第二个input里
                        <MoneyInput
                            inputName='s'
                            inputValue={sI}
                            onInputChange={this.secondInputChange}
                        />

                        {/*通过map将option标签循环添加到第一个select标签里面*/}
                        <select className="select" name="second-select"
                                value={!this.state.flag ? this.state.firstSelectedCountry : this.state.secondSelectedCountry}
                                onChange={this.handleChange}>
                            {
                                Object.keys(this.props.ratesObj).map((key) => (
                                    <option key={key.toString()}
                                            value={key}>{key} - {this.props.countriesObj[key]}</option>))
                            }
                        </select>

                        {/*exchange按钮 将当前flag值传递给ChangeCountry类，同时将ChangeCountry类改变的flag值作为参数，通过buttonToggle方法传回当前这个类*/}
                        <ChangeCountry currentFlag={this.state.flag} buttonToggle={flag => this.buttonToggle(flag)}/>
                    </div>

                </div>
            )
        }
    }

// 总控 异步加载api
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {ratesObj: '', countriesObj: ''};
    }

    componentDidMount() {

        // 注意fetch的语法，其实跟Promise差不多少
        this.getCurrencyRates = fetch(this.props.api.getCurrencyRatesAPI).then(res => {
            res.json().then(resJSON => this.setState({ratesObj: resJSON.rates}));

        });

        this.getCountries = fetch(this.props.api.getCountriesAPI).then(res => {
            res.json().then(resJSON => this.setState({countriesObj: resJSON.currencies}));

        });
    }

    componentWillUnmount() {
        this.getCurrencyRates.abort();
        this.getCountries.abort();
    }

    render() {
        return (
            <div>
                <CountryChoice ratesObj={this.state.ratesObj} countriesObj={this.state.countriesObj}/>
            </div>
        )
    }
}

ReactDOM.render(
    // 这里的api是个对象，存放上面所说的两个url，这里就不贴出来了
    <App api={api}/>,
    document.getElementById('root'),
);