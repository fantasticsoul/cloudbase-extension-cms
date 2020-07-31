import { IsNotEmpty } from 'class-validator'
import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { CollectionV2 } from '@/constants'
import { RecordExistException } from '@/common'
import { CloudBaseService } from '@/dynamic_modules/cloudbase'

export class Project {
    @IsNotEmpty()
    name: string

    description: string

    // project cover image url
    cover?: string
}

const Default_Projects = [
    {
        _id: 'v1',
        name: 'CMS V1 项目',
        description: '包含 CMS V1 版本所有的内容'
    },
    {
        _id: 'default',
        name: '默认项目',
        description: 'CMS V2 默认项目'
    }
]

@Controller('project')
export class ProjectController {
    constructor(private readonly cloudbaseService: CloudBaseService) {}

    @Get()
    async getProjects(@Query() query: { page?: number; pageSize?: number } = {}) {
        const { page = 1, pageSize = 10 } = query
        const res = await this.cloudbaseService
            .collection(CollectionV2.Projects)
            .where({})
            .skip(Number(page - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .get()

        return {
            data: [...Default_Projects, ...res.data]
        }
    }

    // create a project
    @Post()
    async createProject(@Body() body: Project) {
        const { name } = body

        const { data } = await this.cloudbaseService
            .collection(CollectionV2.Projects)
            .where({
                name
            })
            .limit(1)
            .get()

        if (data) {
            throw new RecordExistException()
        }

        const project = {
            ...body,
            _create_time: new Date()
        }
        return this.cloudbaseService.collection(CollectionV2.Projects).add(project)
    }
}
