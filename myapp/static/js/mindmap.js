/**
 * @classdesc mindmap 封装
 * @param {string}  containerID dom ID
 * @param {string}  rootTopic 根节点显示文本
 * @date 2024-03-08
 * @author TsangEEE
 */

class mindmap {
    /**
     * @private
     * @desc 思维导图模型对象
     */
    jm = null;

    /**
     * @private
     * @desc 画布渲染绑定的 dom 对象
     */
    element = null;

    /**
     * @private
     * @desc 当前选择的节点
     */
    selectNode = null;

    /**
     * @param {string} containerID 绑定的 dom ID
     * @param {string} rootTopic 根节点显示文本
     */
    constructor(containerID, rootTopic) {
        this.containerID = containerID;
        this.rootTopic = rootTopic;

        try {
            this.element = document.getElementById(containerID);
            if (!this.element) {
                throw new Error('找不到挂载点');
            }

            this.initMind();

        } catch (e) {
            console.log('jointjs error:', e.message);
        }
    }

    /**
     * @protected
     * @description 初始化思维导图
     */
    initMind() {
        const options = {
            container: this.containerID,
            theme: 'primary',
            editable: true,
            view: {
                node_overflow: 'wrap' // 节点文本过长时的样式
            },
        };
        const mindData = {
            "meta": {
                "name": "jsMind Demo",
                "author": "TsangEEE",
                "version": "0.1"
            },
            "format": "node_tree",
            "data": {
                "id": "root",
                "topic": this.rootTopic,
                "children": []
            }
        };
        this.jm = new jsMind(options);
        this.jm.show(mindData);
    }

    /**
     * @protected
     * @description 添加节点数据
     * @param {string} parentID 父节点ID
     * @param {Array} nodeID 节点ID
     * @param {Array} nodeTopic 节点列表，每个节点为一个对象 {id: string, topic: string, direction?: string}
     */
    addNodes(parentID, nodeID, nodeTopic) {
        for (let i = 0; i < nodeTopic.length; i++) {
            this.jm.add_node(parentID, nodeID[i], nodeTopic[i], null, "right")
        }
    }

    /**
     * @protected
     * @description 删除节点
     * @param {Oject} jmnode 需要删除的节点
     */
    removeNode(jmnode) {
        try {
            if (!jmnode) {
                throw new Error('没有选择节点，无法删除');
            }

            this.jm.remove_node(jmnode)

        } catch (e) {
            console.log('jointjs error:', e.message);
        }
    }

    /**
     * @public
     * @description 获取当前选中的节点的ID
     * @returns {string|null} 当前选中节点的ID，如果没有选中的节点则返回null
     */
    getSelectedNodeId() {
        this.selectNode = this.jm.get_selected_node()
        return this.selectNode.id
    }

    /**
     * @public
     * @description 获取当前选中的节点的内容
     * @returns {string|null} 当前选中节点的ID，如果没有选中的节点则返回null
     */
    getSelectedNodeTopic() {
        this.selectNode = this.jm.get_selected_node()
        return this.selectNode.topic;
    }

    /**
     * @public
     * @description 获取当前选中的节点
     * @returns {Object|null} 当前选中节点，如果没有选中的节点则返回null
     */
    getSelectedNode() {
        this.selectNode = this.jm.get_selected_node();
        return this.selectNode
    }


    /**
     * @protected
     * @description 添加图像节点
     * @param {string} parentID 父节点ID
     * @param {string} nodeTopic 节点显示文本
     * @param {string | ArrayBuffer} imageData 图片数据
     * @param {string} width
     * @param {string} height
     */
    addImageNode(parentID, nodeTopic, imageData, width = '200', height = '100') {
        var nodeID = genRandomID(); // 生成新节点的ID
        const data = {
            'background-image': imageData,
            'width': width,
            'height': height,
        };
        this.jm.add_node(parentID, nodeID, nodeTopic, data); // 添加含有图片的节点

    }


}

const myMindmap = new mindmap('Global-Workflow', 'MyMindMap');
// 添加节点数据
myMindmap.addNodes('root', ['sub1', 'sub2'], ['Subtopic 1', 'Subtopic 2'])
// 添加子节点
myMindmap.addNodes('sub1', ['sub1_child1'], ['Child of Subtopic 1'])


$(document).ready(function () {
    createContextMenu()
    // 实例化mindmap类，指定容器和根节点主题
    setupImageChooser(myMindmap);
})

/**
 * @protected
 * @description 右击显示菜单
 */
function createContextMenu() {
    const $container = $('#Global-Workflow');
    // 先移除旧的 contextMenu，避免多个菜单
    $("#contextMenu").remove();

    const $menu = $(
        `<div id="contextMenu">
            <ul>
                <li id="addNode">Add Node</li>
                <li id="removeNode">Delete Node</li>
                <li id="genFeature">Generate Feature</li>
                <li id="addFeature">Add Feature</li>
                <li id="reload">Regenerate </li>
            </ul>
        </div>`
    ).css({
        display: "none",
        position: "absolute",
        zIndex: 9999  // 使菜单显示在最前面
    }).appendTo('#Global-Workflow');

    // 容器上的右键点击事件
    $container.off("contextmenu").on("contextmenu", function (event) {
        event.preventDefault();
        const x = event.clientX;
        const y = event.clientY;

        $menu.css({
            left: x,
            top: y,
            display: "block"
        });
    });

    // 绑定单击事件到菜单项
    $("#addNode").off('click').on('click', function (event) {
        event.stopPropagation();
        if (myMindmap.getSelectedNodeId() !== null) {
            myMindmap.addNodes(myMindmap.getSelectedNodeId(), [genRandomID()], ['New Node'])
        } else {
            alert("Please at least select one node!")
        }

        $menu.hide();

    });

    $("#removeNode").off('click').on('click', function (event) {
        event.stopPropagation();
        var removeNode = myMindmap.getSelectedNode()
        if (removeNode !== null) {
            myMindmap.removeNode(removeNode)
        } else {
            alert("Please at least select one node!")
        }
        $menu.hide();

    });

    $("#genFeature").off('click').on('click', function (event) {
        event.stopPropagation();
        $menu.hide();
    });

    $("#addFeature").off('click').on('click', function (event) {
        event.stopPropagation();
        if (myMindmap.getSelectedNodeId() !== null) {
            menuAddFeature(myMindmap.getSelectedNodeTopic());
        } else {
            alert("Please at least select one node!")
        }
        $menu.hide();

    });

    $("#reload").off('click').on('click', function (event) {
        event.stopPropagation();
        $menu.hide();
    });

    $container.off("click").on("click", function () {
        $menu.hide();
    });
}


/**
 * @protected
 * @description 根据选中的节点文本添加到 feature选项中
 * @param {string} value - 思维导图的实例。
 */
function menuAddFeature(value) {
    var count = $('.checkboxes-container .check-box').length;

    // Increment count to use for the new element's ID
    count++;
    var newCheckBox = `<div class="check-box">
            <input type="checkbox" id="feature-check-${count}"/>
            <textarea id="feature-value-${count}">${value}</textarea>
        </div>`;

    // Append the new .check-box to the .checkboxes-container
    $('.checkboxes-container').append(newCheckBox);
}

/**
 * @protected
 * @description 点击添加图片按钮
 * @param {Object} mindmapInstance - 思维导图的实例。
 */
function setupImageChooser(mindmapInstance) {
    $('#addImg').on('click', function () {
        // Ensure a node is selected
        if (!mindmapInstance.getSelectedNode()) {
            alert('Please select a node first.');
            return;
        }
        $('#image-chooser').trigger('click'); // Trigger file input
    });

    $('#image-chooser').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = function () {
                const selectedNode = mindmapInstance.getSelectedNode();
                if (selectedNode) {
                    // Adjusted parameters to match updated method signature
                    mindmapInstance.addImageNode(selectedNode.id, '', reader.result);
                } else {
                    alert('Please select a node first.');
                }
            };
            reader.readAsDataURL(file); // Convert image to base64 string
        }
    });
}


