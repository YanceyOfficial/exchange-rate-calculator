# 汇率计算器 by React

## [本文出处](https://www.yanceyleo.com/blog/React/currency-exchange-component-by-react/)


## 功能实现

![组件分割示意图](https://www.yanceyleo.com/media/markdownx/23001024-d8f4-43e7-a976-73337b65591f.png)

既然React的卖点是组件化（话说昨天面试小姐姐问React除了组件化还有什么，我居然忘了**声明式**，悔しい）。上图是自己的划分思路：

1. 首先粉色部分（①区）显示的是实时汇率，初始值是美元和欧元的汇率比，当改变④或⑤，或者点击⑥时，①区根据当前状态进行实时切换，而②和③区的改变是不会影响①区的；

2. ②和③区可以输入数字，根据目前选定的汇率，来实时换算货币值，比如就上图来说，在②区输入10，③区会实时变成8.12304；

3. ④和⑤区是整个组件的核心，它们的值决定着其他各组件的方方面面；

4. 当点击⑥区时，④和⑤当前选定的值会交换，②区值不会变，但因为汇率发生了变化，③区的值将发生变动，此时①区的汇率也将发生反转；

5. 当然最外层的App类控制api的异步加载。

## 具体实现

### App类

名字懒得起了，就叫App好了，这个类主要用来异步加载两个json文件，第一次用到了fetch，听说能代替传统的Ajax，与之类似的还有什么axois、superagent,忙过这几天依次做一下研究。

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
	

###实时汇率展示类

这个类就是个受，自己啥都干不了。当select元素触发**onchange事件**抑或button被点击(触发**onclick事件**)时，这里就会发生变动。这个类只需要接受**CountryChoice类**（就是上面说到的核心类）的三个参数，分别是示意图中④和⑤区正在被选中的那两个币种，还有就是两个币种之间的汇率。

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


### exchange按钮类

这个类接受一个Boolean类型的flag，flag的定义同样是在**CountryChoice类**里面，每点击一次按钮，flag值就会从true和false之间切换，然后通过**this.props.buttonToggle**这个方法将实时的flag值传递回**CountryChoice类**，当然**this.props.buttonToggle**方法定义在**CountryChoice类**里，下面会说到。

	// exchange按钮交换两个select，同时会改变 实时汇率展示 模块
	class ChangeCountry extends React.Component {
	    constructor(props) {
	        super(props);
	        this.state = {currentFlag: this.props.currentFlag};
	        this.buttonClick = this.buttonClick.bind(this);
	    }
	
	    buttonClick() {
	        // 一定要把 !this.state.currentFlag 先存到一个变量，再把这个变量赋值到setState里
	        // 否则第一次点击按钮还是true，第二次才变成false
	        const currentFlag = !this.state.currentFlag;
	        this.setState({
	            currentFlag: currentFlag
	        });
	        this.props.buttonToggle(currentFlag);
	    }
	
	    render() {
	        return (
	            <button className="button" onClick={this.buttonClick}>Exchange</button>
	        )
	    }
	}

### 金额输入类

首先先写一个isNumber方法，是为了阻止用户输入**非数字**，且只能输入一个**小数点**。因为有两个input元素，所以先给两个元素命名。因为在任意一个input中输入值都会实时影响到另一个，所以这里就涉及到了<mark>状态提升</mark>问题，可以去研究[官方文档-状态提升](https://doc.react-china.org/docs/lifting-state-up.html)的这个例子。
	
	// 命名两个input输入框
	const inputNames = {f: 'firstInput', s: 'secondInput'};

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

### 币种（国家）选择类

高潮来了，额，重点来了。这个类控制着币种的选择，解释都放在了注释里，代码写得有点儿绕，都是exchange按钮惹的祸。写下来发现React的一个重点就是**React 组件间通讯**:

- 【父组件】向【子组件】传值；

- 【子组件】向【父组件】传值；

- 没有任何嵌套关系的组件之间传值（如：兄弟组件之间传值）

这里推荐两篇文章，一个是淘宝前端团队的[React 组件间通讯](http://taobaofed.org/blog/2016/11/17/react-components-communication/);另一个是在SegmentFault的一篇文章[React 组件之间如何交流](https://segmentfault.com/a/1190000004044592)，把人家演示的例子敲一敲，基本上就能理解了。


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


