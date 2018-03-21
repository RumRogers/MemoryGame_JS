function Observable()
{
    this.subscribers = [];

    this.subscribe = function(subscriber)
    {
        this.subscribers.push(subscriber);
    };

    this.notify = function(message)
    {
        for(var i = 0; i < this.subscribers.length; i++)
            this.subscribers[i](message);
    };
}