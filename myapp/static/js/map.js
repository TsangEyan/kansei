class MindMap {
    /**
     * @private
     * @desc 画布模型对象
     */
    graph = null;

    /**
     * @private
     * @desc 画布视图对象
     */
    paper = null;

    /**
     * @private
     * @desc 画布渲染绑定的 dom 对象
     */
    element = null;

    /**
     * @param {string} containerId 绑定的 dom ID
     * @param {boolean} elementMove 是否禁用元素拖拽
     */
    constructor(containerId) {
        try {
            this.element = document.getElementById(containerId);
            if (!this.element) {
                throw new Error('找不到挂载点');
            }
            this.initGraph();
            this.initPaper();


        } catch (e) {
            console.log('jointjs error:', e.message);
        }


        this.bindDragPaper();
        this.mainTopic = null;
    }

    /**
     * @protected
     * @description 初始化画布模型，
     */
    initGraph() {
        // this.graph = new joint.dia.Graph({}, {cellNamespace: joint.shapes});
        this.graph = new joint.dia.Graph();
    }

    initPaper() {
        this.paper = new joint.dia.Paper({
            el: this.element,   // 挂载的 dom 元素
            model: this.graph,  // 关联声明的 graph
            width: 2000,
            height: 2000,
            gridSize: 20,
            drawGrid: {name: "dot"},
            async: true,
            sorting: joint.dia.Paper.sorting.APPROX,
            background: {
                color: 'rgba(245, 245, 245, 1)'
            },
            linkPinning: false
        });
    }

    /**
     * @private
     * @description 绑定画布拖拽移动事件。
     * 这个方法设置了一个事件监听器，当用户在画布的空白区域按下鼠标时触发拖拽移动的行为
     */
    bindDragPaper() {
        this.paper.on('blank:pointerdown', (event, x, y) => {
            var startPos = {x: x, y: y};
            const mouseMove = (e) => {
                this.paper.translate(
                    e.originalEvent.movementX + this.paper.translate().tx,
                    e.originalEvent.movementY + this.paper.translate().ty
                );
            };

            $(document).on('mousemove', mouseMove);

            $(document).on('mouseup', () => {
                $(document).off('mousemove', mouseMove);
            });
        });
    }

    /**
     * @private
     * @description 创建一个矩形文本
     * @param {string} text 显示的文字文字
     * @param {number} x 坐标
     * @param {number} y 坐标
     */
    addRectangle(text, x, y) {
        var rectangle = new joint.shapes.standard.Rectangle();
        rectangle.resize(100, 100);
        rectangle.position(50, 10);
        rectangle.attr('root/title', 'joint.shapes.standard.Rectangle');
        rectangle.attr('label/text', 'Rectangle');
        rectangle.attr('body/fill', 'lightblue');
        rectangle.addTo(this.graph);
    }


    addMainTopic(text, position = {x: 0, y: 0}, size = {width: 100, height: 40}, color = 'blue') {
        // if (this.mainTopic) {
        //     console.warn("Main topic already exists. Only one main topic is allowed.");
        //     return;
        // }

        this.mainTopic = new joint.shapes.standard.Rectangle();
        this.mainTopic.position(position.x, position.y);
        this.mainTopic.resize(size.width, size.height);
        this.mainTopic.attr({
            body: {
                fill: color
            },
            label: {
                text: text,
                fill: 'white'
            }
        });
        this.mainTopic.addTo(this.graph);
    }

    addSubTopic(mainTopic, text, position, color = 'green') {

        var subTopic = this.mainTopic.clone();
        subTopic.position(position.x, position.y);
        subTopic.attr({
            label: {
                text: text
            },
            body: {
                fill: color
            }
        });
        subTopic.addTo(this.graph);

        var link = new joint.shapes.standard.Link();
        link.source(this.mainTopic);
        link.target(subTopic);
        link.addTo(this.graph);

        return subTopic;
    }

    /**
     * @protected
     * @description 获取元素文本
     * @param {string} cellId 元素的ID
     */
    getElementText(cellId) {
        const cell = this.graph.getCell(cellId);
        return cell ? cell.attr('label/text') : undefined;
    }
}

// 使用示例
const mindMap = new MindMap('Global-Workflow');


mindMap.addMainTopic('主题');
mindMap.addSubTopic(mindMap.mainTopic, '子主题 1', {x: 100, y: 100}, 'green');
mindMap.addSubTopic(mindMap.mainTopic, '子主题 2', {x: 500, y: 100}, 'orange');

// const text = mindMap.getElementText('c11');

