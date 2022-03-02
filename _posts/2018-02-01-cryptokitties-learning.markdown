---
title: "CryptoKitties 源码解读"
date:   2018-02-01
tags:
  - bitcoin
  - blockchain
---

CryptoKitties <https://www.cryptokitties.co> 是一款构建在以太坊智能合约之上的交易猫咪的游戏。其热度造成了以太坊交易的拥堵。最近每天的交易量也超过了1000tx/day，区区一千比一天的交易就让以太坊网络拥堵，不禁要思考，区块链还有很长的道路要走~

> ![Image]({{ site.url }}/images/post_images/2018-02-01-cryptokitties-learning/pic1.jpg)

其开发团队凭借CryptoKitties项目在ETHWaterloo编程马拉松中被选为八个获奖者之一。闲话少说。

源码可见
<https://ethfiddle.com/09YbyJRfiI>

从代码中，我们能大致得到以下结构图

> ![Image]({{ site.url }}/images/post_images/2018-02-01-cryptokitties-learning/pic2.jpg)

####0. 合约维护(KittyAccessControl)
我们知道，基于以太坊的应用都属于DApp（去中心化应用），其最大的缺点就是维护更新成本极高，因为DApp的基本性质，决定了开发者一旦发布了应用，就很难修改，历史上比特币的第一次和第二次更新，也是冒着毁于一旦的危险进行的。
团队很聪明的加了一个KittyAccessControl合约，用于维护合约。其中包含三个特殊账号地址。这三个账号中的任意一个账号都有暂停所有交易的权限，此外，他们分别有。
#####CEO：修改新的合约地址，指派新的CFO和COO
>倘若有一天团队更新了合约的内容，CryptoKitties是不可能持续运行在原有的合约之上，这时候就需要修改合约地址，指向新的规则所定义的地址。而这个CEO账号就拥有这样的权限。

#####CFO：提取游戏中玩家支付的以太币
>COO通过自己的账号卖出创世猫，并且每个用户交易，交配时，都会产生手续费，CFO则有权限提取这笔费用。

#####COO：释放赠送的猫和创世猫
>每只创世猫都是由COO账号卖出。

#####源码：
```js
contract KittyAccessControl {
    // This facet controls access control for CryptoKitties. There are four roles managed here:
    //
    //     - The CEO: The CEO can reassign other roles and change the addresses of our dependent smart
    //         contracts. It is also the only role that can unpause the smart contract. It is initially
    //         set to the address that created the smart contract in the KittyCore constructor.
    //
    //     - The CFO: The CFO can withdraw funds from KittyCore and its auction contracts.
    //
    //     - The COO: The COO can release gen0 kitties to auction, and mint promo cats.
    //
    // It should be noted that these roles are distinct without overlap in their access abilities, the
    // abilities listed for each role above are exhaustive. In particular, while the CEO can assign any
    // address to any role, the CEO address itself doesn't have the ability to act in those roles. This
    // restriction is intentional so that we aren't tempted to use the CEO address frequently out of
    // convenience. The less we use an address, the less likely it is that we somehow compromise the
    // account.

    /// @dev Emited when contract is upgraded - See README.md for updgrade plan
    event ContractUpgrade(address newContract);

    // The addresses of the accounts (or contracts) that can execute actions within each roles.
    address public ceoAddress;
    address public cfoAddress;
    address public cooAddress;

    // @dev Keeps track whether the contract is paused. When that is true, most actions are blocked
    bool public paused = false;

    /// @dev Access modifier for CEO-only functionality
    modifier onlyCEO() {
        require(msg.sender == ceoAddress);
        _;
    }

    /// @dev Access modifier for CFO-only functionality
    modifier onlyCFO() {
        require(msg.sender == cfoAddress);
        _;
    }

    /// @dev Access modifier for COO-only functionality
    modifier onlyCOO() {
        require(msg.sender == cooAddress);
        _;
    }

    modifier onlyCLevel() {
        require(
            msg.sender == cooAddress ||
            msg.sender == ceoAddress ||
            msg.sender == cfoAddress
        );
        _;
    }

    /// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
    /// @param _newCEO The address of the new CEO
    function setCEO(address _newCEO) external onlyCEO {
        require(_newCEO != address(0));

        ceoAddress = _newCEO;
    }

    /// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
    /// @param _newCFO The address of the new CFO
    function setCFO(address _newCFO) external onlyCEO {
        require(_newCFO != address(0));

        cfoAddress = _newCFO;
    }

    /// @dev Assigns a new address to act as the COO. Only available to the current CEO.
    /// @param _newCOO The address of the new COO
    function setCOO(address _newCOO) external onlyCEO {
        require(_newCOO != address(0));

        cooAddress = _newCOO;
    }

    /*** Pausable functionality adapted from OpenZeppelin ***/

    /// @dev Modifier to allow actions only when the contract IS NOT paused
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    /// @dev Modifier to allow actions only when the contract IS paused
    modifier whenPaused {
        require(paused);
        _;
    }

    /// @dev Called by any "C-level" role to pause the contract. Used only when
    ///  a bug or exploit is detected and we need to limit damage.
    function pause() external onlyCLevel whenNotPaused {
        paused = true;
    }

    /// @dev Unpauses the smart contract. Can only be called by the CEO, since
    ///  one reason we may pause the contract is when CFO or COO accounts are
    ///  compromised.
    /// @notice This is public rather than external so it can be called by
    ///  derived contracts.
    function unpause() public onlyCEO whenPaused {
        // can't unpause if contract was upgraded
        paused = false;
    }
}
```

####1. 猫咪属性(Kitty)
>在比特币和以太币中，我们携带的数据只有数值本身，但是在智能合约中，这个数值可以是一个数据结构，这就让许多区块链应用成为了可能。

#####uint256 genes
>基因列，决定了猫咪的长相，交配后，生成相关与父母的基因对，代码闭源。
一点自己的思考，经过那么久，我冥冥之中觉得，人类的基因组跟哈希加密有着类似的功能，基因携带的信息可以不断溯源，推导出最早的人类，区块链账本也是一样。总之细思极恐~

#####uint64 cooldownEndBlock
>繁殖的冷却时间。

#####uint16 generation
>代数，创世猫为0gen。
大部分参数跟游戏规则有关，我就不细讲了，但是基于区块链的角度看，有些人会认为区块链中定义的所有数据都是不能更改的，这样理解是有误的，应该理解成：**区块链中数据传输的规则**是不能更改的。例如比特币实现的是一个最简单的规则:
『sum(input1+ input2 + ...) >= sum(output1 + output2 + ...)』

#####源码：
```js
    /// @dev The main Kitty struct. Every cat in CryptoKitties is represented by a copy
    ///  of this structure, so great care was taken to ensure that it fits neatly into
    ///  exactly two 256-bit words. Note that the order of the members in this structure
    ///  is important because of the byte-packing rules used by Ethereum.
    ///  Ref: http://solidity.readthedocs.io/en/develop/miscellaneous.html
    struct Kitty {
        // The Kitty's genetic code is packed into these 256-bits, the format is
        // sooper-sekret! A cat's genes never change.
        uint256 genes;

        // The timestamp from the block when this cat came into existence.
        uint64 birthTime;

        // The minimum timestamp after which this cat can engage in breeding
        // activities again. This same timestamp is used for the pregnancy
        // timer (for matrons) as well as the siring cooldown.
        uint64 cooldownEndBlock;

        // The ID of the parents of this kitty, set to 0 for gen0 cats.
        // Note that using 32-bit unsigned integers limits us to a "mere"
        // 4 billion cats. This number might seem small until you realize
        // that Ethereum currently has a limit of about 500 million
        // transactions per year! So, this definitely won't be a problem
        // for several years (even as Ethereum learns to scale).
        uint32 matronId;
        uint32 sireId;

        // Set to the ID of the sire cat for matrons that are pregnant,
        // zero otherwise. A non-zero value here is how we know a cat
        // is pregnant. Used to retrieve the genetic material for the new
        // kitten when the birth transpires.
        uint32 siringWithId;

        // Set to the index in the cooldown array (see below) that represents
        // the current cooldown duration for this Kitty. This starts at zero
        // for gen0 cats, and is initialized to floor(generation/2) for others.
        // Incremented by one for each successful breeding action, regardless
        // of whether this cat is acting as matron or sire.
        uint16 cooldownIndex;

        // The "generation number" of this cat. Cats minted by the CK contract
        // for sale are called "gen0" and have a generation number of 0. The
        // generation number of all other cats is the larger of the two generation
        // numbers of their parents, plus one.
        // (i.e. max(matron.generation, sire.generation) + 1)
        uint16 generation;
    }
```

####2. 创造创世猫(createGen0Auction)
>function _createKitty用于创造猫咪，然而创造创世猫，只有COO通过调用方法
『_createKitty(0, 0, 0, _genes, address(COO_ADDR));』
才能生成。_createKitty方法将在繁殖里面细讲。

#####源码：
```js
    /// @dev Creates a new gen0 kitty with the given genes and
    ///  creates an auction for it.
    function createGen0Auction(uint256 _genes) external onlyCOO {
        require(gen0CreatedCount < GEN0_CREATION_LIMIT);

        uint256 kittyId = _createKitty(0, 0, 0, _genes, address(this));
        _approve(kittyId, saleAuction);

        saleAuction.createAuction(
            kittyId,
            _computeNextGen0Price(),
            0,
            GEN0_AUCTION_DURATION,
            address(this)
        );

        gen0CreatedCount++;
    }
```

####3. 拍卖(transferOwnership)
>这是加密猫中最简单的一部分，两行代码搞定。

#####源码：
```js
  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) {
      owner = newOwner;
    }
  }
}
```
好吧是三行~

####4. 繁殖(createKitty)
>智能合约之所以称为区块链2.0就是因为它对比特币的脚本部分进行了拓展。比特币在每个交易过程中，都有一个通过公钥验证签名的脚本，是一种类似Forth的简单堆栈试编程语言，但是这个脚本语言是非图灵完备的。
而在以太坊体系里，开发者支付一点费用，便可以将自己的合约发布到区块链里，作为程序被人调用。每当用户进行猫咪繁殖时，这个方法就会被调用，程序执行之后的输出值，就会作为结果被打包进入区块。程序是用Solidity编写，执行的过程则是交给以太坊专用虚拟机（EVM）。

>繁殖猫咪的过程，是由一系列参数通过_createKitty方法所产生，其中有：

#####uint256 _matronId
>父亲id，不存在则为0，创建创世猫时候，就是传0。

#####address _owner
>拥有者地址

#####源码：
```js
function _createKitty(
        uint256 _matronId,
        uint256 _sireId,
        uint256 _generation,
        uint256 _genes,
        address _owner
    )
        internal
        returns (uint)
    {
        // These requires are not strictly necessary, our calling code should make
        // sure that these conditions are never broken. However! _createKitty() is already
        // an expensive call (for storage), and it doesn't hurt to be especially careful
        // to ensure our data structures are always valid.
        require(_matronId == uint256(uint32(_matronId)));
        require(_sireId == uint256(uint32(_sireId)));
        require(_generation == uint256(uint16(_generation)));

        // New kitty starts with the same cooldown as parent gen/2
        uint16 cooldownIndex = uint16(_generation / 2);
        if (cooldownIndex > 13) {
            cooldownIndex = 13;
        }

        Kitty memory _kitty = Kitty({
            genes: _genes,
            birthTime: uint64(now),
            cooldownEndBlock: 0,
            matronId: uint32(_matronId),
            sireId: uint32(_sireId),
            siringWithId: 0,
            cooldownIndex: cooldownIndex,
            generation: uint16(_generation)
        });
        uint256 newKittenId = kitties.push(_kitty) - 1;

        // It's probably never going to happen, 4 billion cats is A LOT, but
        // let's just be 100% sure we never let this happen.
        require(newKittenId == uint256(uint32(newKittenId)));

        // emit the birth event
        Birth(
            _owner,
            newKittenId,
            uint256(_kitty.matronId),
            uint256(_kitty.sireId),
            _kitty.genes
        );

        // This will assign ownership, and also emit the Transfer event as
        // per ERC721 draft
        _transfer(0, _owner, newKittenId);
        return newKittenId;
    }

    // Any C-level can fix how many seconds per blocks are currently observed.
    function setSecondsPerBlock(uint256 secs) external onlyCLevel {
        require(secs < cooldowns[0]);
        secondsPerBlock = secs;
    }
}
```

####5. 基因配对合约（闭源）
>这个合约的地址是由CEO通过调用setGeneScienceAddress来设定，目前闭源，其实很好理解，当前比较稀有的猫咪都卖到100+ETH，若是被图谋不轨的程序员研究出基因遗传的规则，这对不明真相的小伙伴来讲，游戏就失去了公平性。

####6. 总结
>游戏一直都是技术很好的切入点，CryptoKitties算是目前以太坊落地项目中较为成熟的一个。另外希望大家通过学习能明白以下几点。

#####1. 智能合约中，猫的数据结构是如何表示的。参见第一点
#####2. 猫是如何存储在合约中的。参见第四点
#####3. 以太坊合约中的程序被调用时发生了什么。参见第四点
